import { Schema } from 'mongoose'

export interface PropertyType {
  type: string
  isArray?: boolean
  enumValues?: any[]
  $__schemaType?: any
}

export interface ParsedField {
  type: PropertyType
  options?: { required?: boolean; ref?: string }
  schema?: ParsedType
}

export interface ParsedType {
  [key: string]: ParsedField
}

const simpleType = (opt: any) => {
  const pf: ParsedField = {
    type: {
      type: opt.instance,
      isArray: false
    },
    options: {
      required: !!opt.isRequired
    }
  }
  if (Array.isArray(opt.enumValues) && opt.enumValues.length > 0) {
    pf.type.enumValues = opt.enumValues
  }
  if (opt.options && opt.options.ref) {
    pf.options.ref = opt.options.ref
  }
  if (opt.$isSchemaMap) {
    pf.type.$__schemaType = opt.$__schemaType
  }

  return pf
}

const unflatten = (data: any): any => {
  const result: any = {}
  for (const i in data) {
    const keys = i.split('.')
    keys.reduce((r, e, j) => {
      return (
        r[e] ||
        (r[e] = isNaN(Number(keys[j + 1]))
          ? keys.length - 1 === j
            ? data[i]
            : { __flattened__: true }
          : [])
      )
    }, result)
  }
  return result
}

const parsePaths = (rawPaths: any): ParsedType => {
  const paths = unflatten(rawPaths)
  const res: ParsedType = {}
  Object.keys(paths).forEach((field: string) => {
    const opt = paths[field]

    if (opt.__flattened__) {
      delete opt.__flattened__
      res[field] = {
        type: {
          type: 'Embedded',
          isArray: false
        },
        schema: parsePaths(opt)
      }
    } else if (
      [
        'ObjectID',
        'String',
        'Number',
        'Date',
        'Boolean',
        'Mixed',
        'Buffer',
        'Map',
        'Decimal128'
      ].includes(opt.instance)
    ) {
      res[field] = simpleType(opt)
    } else if (opt.instance === 'Embedded') {
      res[field] = simpleType(opt)
      res[field].schema = parsePaths(opt.schema.paths)
    } else if (opt.instance === 'Array') {
      if (opt.$isMongooseDocumentArray) {
        res[field] = simpleType(opt)
        res[field].type.type = 'Schema'
        res[field].type.isArray = true
        res[field].schema = parsePaths(opt.schema.paths)
      } else if (opt.$isMongooseArray) {
        res[field] = simpleType(opt.caster)
        res[field].type.isArray = true
      }
    } else {
      console.warn(`unhandled field: ${field}, ${JSON.stringify(opt, null, 2)}`)
    }
  })

  return res
}

export const parseSchema = (schema: Schema): ParsedType => {
  return parsePaths((schema as any).paths)
}
