import { Schema } from 'mongoose'

export interface PropertyType {
  type: string
  isArray?: boolean
  enumValues?: any[]
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

  return pf
}

const directNestedFields: Map<any, any> = new Map()

export const parseSchema = (schema: Schema): ParsedType => {
  const paths = (schema as any).paths
  const res: ParsedType = {}

  Object.keys(paths).forEach((field: string) => {
    const opt = paths[field]
    // direct nested
    if (field.includes('.')) {
      const f = field.split('.')
      if (f.length !== 2) {
        throw new Error(`invalid direct nested name: ${field}`)
      }

      if (!directNestedFields.has(schema)) {
        directNestedFields.set(schema, {})
      }

      const fieldStore = directNestedFields.get(schema)

      if (!fieldStore[f[0]]) {
        fieldStore[f[0]] = {}
      }

      fieldStore[f[0]][f[1]] = opt
      return
    }
    if (
      ['ObjectID', 'String', 'Number', 'Date', 'Boolean'].includes(opt.instance)
    ) {
      res[field] = simpleType(opt)
    } else if (opt.instance === 'Embedded') {
      res[field] = simpleType(opt)
      res[field].schema = parseSchema(opt.schema)
    } else if (opt.instance === 'Array') {
      if (opt.$isMongooseDocumentArray) {
        res[field] = simpleType(opt)
        res[field].type.type = 'Schema'
        res[field].type.isArray = true
        res[field].schema = parseSchema(opt.schema)
      } else if (opt.$isMongooseArray) {
        res[field] = simpleType(opt.caster)
        res[field].type.isArray = true
      }
    }
  })

  directNestedFields.has(schema) &&
    Object.keys(directNestedFields.get(schema)).forEach((field: string) => {
      const opt = directNestedFields.get(schema)[field]
      res[field] = {
        type: {
          type: 'Embedded',
          isArray: false
        }
      }
      res[field].schema = parseSchema({ paths: opt } as any)
    })

  return res
}
