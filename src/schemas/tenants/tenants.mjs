import Joi from "joi";

export const createTenantSchema = Joi.object({
  apartment: Joi.string().required(),

  // Personal Information
  personalInformation: Joi.object({
    fullName: Joi.string().required(),

    dateOfBirth: Joi.date().required(),

    gender: Joi.string().required(),

    nationality: Joi.string().required(),

    phoneNumbers: Joi.array()
      .items(Joi.string())
      .min(1)
      .required(),

    email: Joi.string().email().optional(),

    currentResidentialAddress: Joi.string().required(),

    maritalStatus: Joi.string()
      .valid("Single", "Married", "Other")
      .required(),

    numberOfOccupants: Joi.number()
      .integer()
      .min(1)
      .required(),
  }).required(),

  // Employment Information
  employmentInformation: Joi.object({
    occupation: Joi.string().required(),

    employerName: Joi.string().required(),

    employerAddress: Joi.string().required(),

    employmentStatus: Joi.string()
      .valid(
        "Full-Time",
        "Part-Time",
        "Self-Employed",
        "Unemployed"
      )
      .required(),

    income: Joi.number()
      .min(0)
      .required(),

    incomeFrequency: Joi.string()
      .valid("Monthly", "Annual")
      .required(),

    otherSourcesOfIncome: Joi.string().optional(),
  }).required(),

  // Rental History
  rentalHistory: Joi.object({
    currentLandlordName: Joi.string().required(),

    currentLandlordContact: Joi.string().required(),

    reasonForLeaving: Joi.string().required(),

    durationAtCurrentResidence: Joi.string().required(),

    previousAddress: Joi.string().optional(),
  }).required(),

  // References
  references: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),

        phone: Joi.string().required(),

        relationship: Joi.string().required(),
      })
    )
    .required(),

  // Identification
  identification: Joi.object({
    idType: Joi.string()
      .valid(
        "National ID",
        "Voter's Card",
        "Driver's License",
        "International Passport"
      )
      .required(),

    idNumber: Joi.string().required(),

    idDocumentUrl: Joi.string().optional(),

    passportPhotoUrl: Joi.string().optional(),

    workIdUrl: Joi.string().optional(),
  }).required(),

  // Additional Information
  additionalInformation: Joi.object({
    hasPets: Joi.boolean().required(),

    smokes: Joi.boolean().required(),

    medicalCondition: Joi.string().optional(),

    emergencyContact: Joi.object({
      name: Joi.string().required(),

      phone: Joi.string().required(),

      relationship: Joi.string().required(),

      address: Joi.string().required(),
    }).required(),
  }).required(),

  // Declaration
  declaration: Joi.object({
    agreed: Joi.boolean()
      .valid(true)
      .required(),

    signature: Joi.string().required(),

    date: Joi.date().required(),
  }).required(),
});

export const updateTenantSchema = Joi.object({
  personalInformation: Joi.object({
    fullName: Joi.string().optional(),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().optional(),
    nationality: Joi.string().optional(),
    phoneNumbers: Joi.array().items(Joi.string()).min(1).optional(),
    email: Joi.string().email().optional(),
    currentResidentialAddress: Joi.string().optional(),
    maritalStatus: Joi.string()
      .valid("Single", "Married", "Other")
      .optional(),
    numberOfOccupants: Joi.number().integer().min(1).optional(),
  }).optional(),

  employmentInformation: Joi.object({
    occupation: Joi.string().optional(),
    employerName: Joi.string().optional(),
    employerAddress: Joi.string().optional(),
    employmentStatus: Joi.string()
      .valid(
        "Full-Time",
        "Part-Time",
        "Self-Employed",
        "Unemployed"
      )
      .optional(),
    income: Joi.number().min(0).optional(),
    incomeFrequency: Joi.string()
      .valid("Monthly", "Annual")
      .optional(),
    otherSourcesOfIncome: Joi.string().optional(),
  }).optional(),

  rentalHistory: Joi.object({
    currentLandlordName: Joi.string().optional(),
    currentLandlordContact: Joi.string().optional(),
    reasonForLeaving: Joi.string().optional(),
    durationAtCurrentResidence: Joi.string().optional(),
    previousAddress: Joi.string().optional(),
  }).optional(),

  references: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        relationship: Joi.string().required(),
      })
    )
    .optional(),

  identification: Joi.object({
    idType: Joi.string()
      .valid(
        "National ID",
        "Voter's Card",
        "Driver's License",
        "International Passport"
      )
      .optional(),
    idNumber: Joi.string().optional(),
    idDocumentUrl: Joi.string().optional(),
    passportPhotoUrl: Joi.string().optional(),
    workIdUrl: Joi.string().optional(),
  }).optional(),

  additionalInformation: Joi.object({
    hasPets: Joi.boolean().optional(),
    smokes: Joi.boolean().optional(),
    medicalCondition: Joi.string().optional(),

    emergencyContact: Joi.object({
      name: Joi.string().optional(),
      phone: Joi.string().optional(),
      relationship: Joi.string().optional(),
      address: Joi.string().optional(),
    }).optional(),
  }).optional(),

  declaration: Joi.object({
    agreed: Joi.boolean().valid(true).optional(),
    signature: Joi.string().optional(),
    date: Joi.date().optional(),
  }).optional(),
});

export const tenantQuerySchema = Joi.object({
  search: Joi.string().trim().allow(""),

  employmentStatus: Joi.string().valid(
    "Full-Time",
    "Part-Time",
    "Self-Employed",
    "Unemployed"
  ),

  maritalStatus: Joi.string().valid(
    "Single",
    "Married",
    "Other"
  ),

  gender: Joi.string().trim(),

  apartment: Joi.string(),

  sortBy: Joi.string().valid(
    "createdAt",
    "updatedAt",
    "fullName",
    "income"
  ).default("createdAt"),

  order: Joi.string()
    .valid("asc", "desc")
    .default("desc"),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
});