// fork from https://github.com/medolino/mongoose-schema-parser
// add result type, use type enum and make it easy to detect whether
// propertyField is array
import { Schema, SchemaTypeOpts } from 'mongoose'

export enum TypeEnum {
  Unknown = 'Unknow',
  String = 'String',
  Number = 'Number',
  Date = 'Date',
  Boolean = 'Boolean',
  ObjectId = 'ObjectId',
  Object = 'Object',
  Schema = 'Schema'
}

export interface PropertyType {
  type: TypeEnum
  isArray?: boolean
}

export interface ParsedField {
  type: PropertyType
  details?: SchemaTypeOpts<any> & { required: boolean }
  schema?: ParsedType
}

export interface ParsedType {
  [key: string]: ParsedField
}

const getTypeFromString = (type: string): TypeEnum => {
  switch (type) {
    case 'String':
      return TypeEnum.String
    case 'Number':
      return TypeEnum.Number
    case 'Date':
      return TypeEnum.Date
    case 'Boolean':
      return TypeEnum.Boolean
    case 'ObjectId':
      return TypeEnum.ObjectId
    case 'Schema':
      return TypeEnum.Schema
    default:
      return TypeEnum.Unknown
  }
}

export const getSchemaObject = (schema: Schema | Schema[]) => {
  let obj: any = {}
  if (Array.isArray(schema)) {
    obj = schema[0].obj ? schema[0].obj : schema[0]
  } else if (schema.obj) {
    obj = schema.obj
  } else if ((schema as any).type) {
    obj = getSchemaObject((schema as any).type)
  } else {
    obj = schema
  }

  return obj
}

export const parseSchema = (schema: Schema): ParsedType => {
  const schemaObj = getSchemaObject(schema)
  const parsedSchema: ParsedType = {}
  Object.keys(schemaObj).forEach((propertyName: string) => {
    const property = schemaObj[propertyName]
    const propertyType = getPropertyType(property)

    parsedSchema[propertyName] = {
      type: propertyType
    }

    const propertyDetails = parsePropertyDetails(property)
    if (propertyDetails) {
      parsedSchema[propertyName].details = propertyDetails
    }

    // parse Schema
    if (propertyType.type === TypeEnum.Schema) {
      // normal schema
      let propSchema
      if (property.hasOwnProperty('obj') || property.hasOwnProperty('type')) {
        propSchema = property
      } else {
        // schema defined as object
        propSchema = { obj: property, options: {} }
      }

      parsedSchema[propertyName].schema = parseSchema(propSchema)
    }

    // check if nested schema
    if (propertyType.type === TypeEnum.Schema && propertyType.isArray) {
      parsedSchema[propertyName].schema = parseSchema(property)
    }
  })

  return parsedSchema
}

export const parsePropertyDetails = (property: any) => {
  if (!property.type) {
    return undefined
  }

  const detailNames = Object.keys(property)

  const details = detailNames
    .filter(propName => propName !== 'type')
    .reduce(
      (details, propName) => {
        switch (propName) {
          case 'required': // convert to boolean
            details.required = !!property[propName]
            break
          default:
            details[propName] = property[propName]
        }

        return details
      },
      {} as any
    )

  return detailNames.length > 0 ? details : undefined
}

export const getPropertyType = (property: any): PropertyType => {
  let type: PropertyType = {
    type: TypeEnum.Unknown,
    isArray: false
  }

  /* istanbul ignore else  */
  if (property.type && property.type.name) {
    // simple type
    type.type = getTypeFromString(property.type.name)
  } else if (property.type) {
    // nested item defined as type
    type = getPropertyType(property.type)
  } else if (property.constructor.name) {
    // array, object, function, string or schema
    type = getPropertyTypeFromConstructor(property)
  }

  return type
}

const getPropertyTypeFromConstructor = (property: any): PropertyType => {
  const constructorName = property.constructor.name

  let type: PropertyType = {
    type: TypeEnum.Unknown,
    isArray: false
  }

  switch (constructorName) {
    case 'Array':
      type = getMongooseArrayType(property)
      break
    case 'Function': // simple type (e.g. String,...)
      type.type = getTypeFromString(property.name)
      break
    case 'Object': // Object or Schema
      type.type = !Object.keys(property).length
        ? TypeEnum.Object
        : TypeEnum.Schema
      break
    default:
      type.type = getTypeFromString(constructorName)
  }

  return type
}

const getMongooseArrayType = (arrayDetails: any): PropertyType => {
  const type: PropertyType = {
    type: TypeEnum.Unknown,
    isArray: true
  }

  if (arrayDetails.length > 0) {
    // check if array content type is provided
    const details = arrayDetails[0]

    // details.name -> simpleTypes [String]
    // details.constructor.name -> Schema, Object

    // ignore details.name if name is schemas property
    const isNameSchemaProperty =
      ['object', 'function'].indexOf(typeof details.name) !== -1

    let arrayContentType: TypeEnum = !isNameSchemaProperty
      ? getTypeFromString(details.name)
      : TypeEnum.Unknown

    if (arrayContentType === TypeEnum.Unknown) {
      // I am assuming it goes for schema, if Object is present inside Array type definition (e.g. field:[{...objProps...}])
      arrayContentType =
        details.constructor.name === 'Object'
          ? TypeEnum.Schema
          : getTypeFromString(details.constructor.name)
    }

    type.type = arrayContentType
  }

  return type
}
