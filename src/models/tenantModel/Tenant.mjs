import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    // Apartment relationship
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
    },

    // 1. Personal Information
    personalInformation: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      dateOfBirth: {
        type: Date,
        required: true,
      },

      gender: {
        type: String,
        required: true,
        trim: true,
      },

      nationality: {
        type: String,
        required: true,
        trim: true,
      },

      phoneNumbers: {
        type: [String],
        required: true,
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
      },

      currentResidentialAddress: {
        type: String,
        required: true,
        trim: true,
      },

      maritalStatus: {
        type: String,
        enum: ["Single", "Married", "Other"],
        required: true,
      },

      numberOfOccupants: {
        type: Number,
        required: true,
        min: 1,
      },
    },

    // 2. Employment & Financial Information
    employmentInformation: {
      occupation: {
        type: String,
        required: true,
        trim: true,
      },
    
      employerName: {
        type: String,
        required: true,
        trim: true,
      },
    
      employerAddress: {
        type: String,
        required: true,
        trim: true,
      },
    
      employmentStatus: {
        type: String,
        enum: [
          "Full-Time",
          "Part-Time",
          "Self-Employed",
          "Unemployed",
        ],
        required: true,
      },
    
      income: {
        type: Number,
        required: true,
        min: 0,
      },
    
      incomeFrequency: {
        type: String,
        enum: ["Monthly", "Annual"],
        required: true,
      },
    
      otherSourcesOfIncome: {
        type: String,
        trim: true,
      },
    },

    // 3. Rental History
    rentalHistory: {
      currentLandlordName: {
        type: String,
        required: true,
        trim: true,
      },

      currentLandlordContact: {
        type: String,
        required: true,
        trim: true,
      },

      reasonForLeaving: {
        type: String,
        required: true,
        trim: true,
      },

      durationAtCurrentResidence: {
        type: String,
        required: true,
        trim: true,
      },

      previousAddress: {
        type: String,
        trim: true,
      },
    },

    // 4. References
    references: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        phone: {
          type: String,
          required: true,
          trim: true,
        },

        relationship: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],

    // 5. Identification
    identification: {
      idType: {
        type: String,
        enum: [
          "National ID",
          "Voter's Card",
          "Driver's License",
          "International Passport",
        ],
        required: true,
      },

      idNumber: {
        type: String,
        required: true,
        trim: true,
      },

      idDocumentUrl: {
        type: String,
        default: "",
      },
      
      idDocumentPublicId: {
        type: String,
        default: "",
      },
      
      passportPhotoUrl: {
        type: String,
        default: "",
      },
      
      passportPhotoPublicId: {
        type: String,
        default: "",
      },
      
      workIdUrl: {
        type: String,
        default: "",
      },
      
      workIdPublicId: {
        type: String,
        default: "",
      },
    },

    // 6. Additional Information
    additionalInformation: {
      hasPets: {
        type: Boolean,
        required: true,
      },

      smokes: {
        type: Boolean,
        required: true,
      },

      medicalCondition: {
        type: String,
        trim: true,
        default: "",
      },

      emergencyContact: {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        phone: {
          type: String,
          required: true,
          trim: true,
        },

        relationship: {
          type: String,
          required: true,
          trim: true,
        },

        address: {
          type: String,
          required: true,
          trim: true,
        },
      },
    },

    // 7. Declaration
    declaration: {
      agreed: {
        type: Boolean,
        required: true,
      },

      signature: {
        type: String,
        required: true,
        trim: true,
      },

      date: {
        type: Date,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Tenant = mongoose.model("Tenant", tenantSchema);

export default Tenant;