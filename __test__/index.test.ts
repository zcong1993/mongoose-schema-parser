import { Schema } from 'mongoose'
import { parseSchema, ParsedType, TypeEnum } from '../src'

const ObjectId = Schema.Types.ObjectId

const nestedSchema = new Schema({
  nestedName: String
})

const testSchema = new Schema({
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
    ref: 'Test'
  },
  refs: [
    {
      type: ObjectId,
      ref: 'Test'
    }
  ],
  withTypeField: [
    {
      type: {
        type: String
      },
      other: String
    }
  ]
})

const expectResult: ParsedType = {
  id: {
    type: {
      type: TypeEnum.ObjectId,
      isArray: false
    }
  },
  name: {
    type: {
      type: TypeEnum.String,
      isArray: false
    }
  },
  age: {
    type: {
      type: TypeEnum.Number,
      isArray: false
    },
    details: {}
  },
  requiredName: {
    type: {
      type: TypeEnum.String,
      isArray: false
    },
    details: {
      required: true
    }
  },
  enumString: {
    type: {
      type: TypeEnum.String,
      isArray: false
    },
    details: {
      enum: ['test1', 'test2']
    }
  },
  date: {
    type: {
      type: TypeEnum.Date,
      isArray: false
    }
  },
  bool: {
    type: {
      type: TypeEnum.Boolean,
      isArray: false
    }
  },
  nested: {
    type: {
      type: TypeEnum.Schema,
      isArray: false
    },
    schema: {
      nestedName: {
        type: {
          type: TypeEnum.String,
          isArray: false
        }
      }
    }
  },
  nestedArr: {
    type: {
      type: TypeEnum.Schema,
      isArray: true
    },
    schema: {
      nestedName: {
        type: {
          type: TypeEnum.String,
          isArray: false
        }
      }
    }
  },
  nestedArr2: {
    details: {},
    type: {
      type: TypeEnum.Schema,
      isArray: true
    },
    schema: {
      type: {
        type: {
          type: TypeEnum.Schema,
          isArray: false
        },
        schema: {
          nestedName: {
            type: {
              type: TypeEnum.String,
              isArray: false
            }
          }
        }
      }
    }
  },
  simpleArr: {
    type: {
      type: TypeEnum.String,
      isArray: true
    }
  },
  simpleArr2: {
    details: {},
    type: {
      type: TypeEnum.String,
      isArray: true
    }
  },
  directNested: {
    type: {
      type: TypeEnum.Schema,
      isArray: false
    },
    schema: {
      name: {
        type: {
          type: TypeEnum.String,
          isArray: false
        }
      },
      age: {
        type: {
          type: TypeEnum.Number,
          isArray: false
        }
      }
    }
  },
  directNestedArr: {
    type: {
      type: TypeEnum.Schema,
      isArray: true
    },
    schema: {
      name: {
        type: {
          type: TypeEnum.String,
          isArray: false
        }
      },
      age: {
        type: {
          type: TypeEnum.Number,
          isArray: false
        }
      }
    }
  },
  ref: {
    type: {
      type: TypeEnum.ObjectId,
      isArray: false
    },
    details: {
      ref: 'Test'
    }
  },
  refs: {
    details: {
      ref: 'Test'
    },
    type: {
      type: TypeEnum.ObjectId,
      isArray: true
    }
  },
  withTypeField: {
    details: {
      other: String
    },
    type: {
      type: TypeEnum.Schema,
      isArray: true
    },
    schema: {
      type: {
        type: {
          type: TypeEnum.String,
          isArray: false
        },
        details: {}
      },
      other: {
        type: {
          type: TypeEnum.String,
          isArray: false
        }
      }
    }
  }
}

it('should work well', () => {
  expect(parseSchema(testSchema)).toEqual(expectResult)
})
