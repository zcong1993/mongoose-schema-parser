import * as mongoose from 'mongoose'
import { parseSchema } from '../src'

const { Schema } = mongoose

const ObjectId = Schema.Types.ObjectId

const nestedSchema = new Schema({
  nestedName: String
})

const refSchema = new Schema(
  {
    refName: String
  },
  { timestamps: true }
)

const testSchema = new Schema(
  {
    id: ObjectId,
    name: String,
    age: {
      type: Number
    },
    requiredName: {
      type: String,
      required: true
    },
    enumString: {
      type: String,
      enum: ['test1', 'test2']
    },
    date: Date,
    bool: Boolean,
    nested: nestedSchema,
    nestedArr: [nestedSchema],
    nestedArr2: [
      {
        type: nestedSchema
      }
    ],
    simpleArr: [String],
    simpleArr2: [
      {
        type: String
      }
    ],
    directNested: {
      name: String,
      age: Number
    },
    directNestedArr: [
      {
        name: String,
        age: Number
      }
    ],
    ref: {
      type: ObjectId,
      ref: 'Ref'
    },
    refs: [
      {
        type: ObjectId,
        ref: 'Ref'
      }
    ],
    withTypeField: [
      {
        type: {
          type: String
        },
        other: String
      }
    ],
    receiver: {
      receiverType: {
        type: String,
        enum: ['all', 'tag']
      },
      receiverValue: {
        tagAnd: {
          type: [String],
          default: []
        },
        tagOr: {
          type: [String],
          default: []
        },
        tagNot: {
          type: [String],
          default: []
        }
      }
    },
    receivers: [
      {
        receiverType: {
          type: String,
          enum: ['all', 'tag']
        },
        receiverValue: {
          tagAnd: {
            type: [String],
            default: []
          },
          tagOr: {
            type: [String],
            default: []
          },
          tagNot: {
            type: [String],
            default: []
          }
        }
      }
    ],
    mixed: Schema.Types.Mixed,
    bf: Buffer,
    mp: {
      type: Map,
      of: Number
    },
    dc: mongoose.Types.Decimal128,
    dcs: [mongoose.Types.Decimal128]
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

it('v2 should works well', () => {
  const res = parseSchema(testSchema)
  expect(res).toMatchSnapshot()
})
