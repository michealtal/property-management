import fs from "fs/promises";
import path from "path"
import httpStatus from "http-status";
import Tenant from "../../models/tenantModel/Tenant.mjs";
import Apartment from "../../models/apartmentModel/Apartment.mjs";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.mjs";
import cloudinary from "../../config/cloudinary.mjs";

export const createTenant = async (req, res) => {
  try {
    const {
      apartment,
      personalInformation,
      employmentInformation,
      rentalHistory,
      references,
      identification,
      additionalInformation,
      declaration,
    } = req.body;

    // Check that the apartment exists
    const apartmentExists = await Apartment.findById(apartment);

    if (!apartmentExists) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: "error",
        message: "Apartment not found",
      });
    }

    // Make sure the apartment belongs to the logged-in landlord
    if (apartmentExists.landlord.toString() !== req.user._id.toString()) {
      return res.status(httpStatus.FORBIDDEN).json({
        status: "error",
        message: "You do not have access to this apartment",
      });
    }

    // Check if apartment is already occupied
    if (apartmentExists.status === "occupied") {
      return res.status(httpStatus.CONFLICT).json({
        status: "error",
        message: "Apartment is already occupied",
      });
    }

    const tenant = await Tenant.create({
      apartment,
      personalInformation,
      employmentInformation,
      rentalHistory,
      references,
      identification,
      additionalInformation,
      declaration,
    });

    // Update apartment status
    apartmentExists.status = "occupied";
    await apartmentExists.save();

    return res.status(httpStatus.CREATED).json({
      status: "success",
      message: "Tenant created successfully",
      data: tenant,
    });
  } catch (error) {
    console.error("Error creating tenant:", error);

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export const getTenants = async (req, res) => {
  try {
    const { 
      search, 
      employmentStatus,
      maritalStatus,
      gender, 
      apartment, 
      sortBy, 
      order, 
      page, 
      limit, } = req.validatedQuery;

    // Find apartments belonging to the logged-in landlord
    const apartments = await Apartment.find({
      landlord: req.user._id,
    }).select("_id");

    const apartmentIds = apartments.map(
      (apartment) => apartment._id
    );

    // Base query: only tenants belonging to this landlord
    const query = {
      apartment: { $in: apartmentIds },
    };

    // Search
    if (search) {
      query.$or = [
        {
          "personalInformation.fullName": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "personalInformation.email": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "personalInformation.phoneNumbers": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Filters
    if (employmentStatus) {
      query["employmentInformation.employmentStatus"] =
        employmentStatus;
    }

    if (maritalStatus) {
      query["personalInformation.maritalStatus"] =
        maritalStatus;
    }

    if (gender) {
      query["personalInformation.gender"] = gender;
    }

    if (apartment) {
      query.apartment = apartment;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sorting
    let sortField;

    if (sortBy === "fullName") {
      sortField = "personalInformation.fullName";
    } else if (sortBy === "income") {
      sortField = "employmentInformation.income";
    } else {
      sortField = sortBy;
    }

    const sortOrder = order === "asc" ? 1 : -1;

    const tenants = await Tenant.find(query)
      .populate("apartment")
      .sort({
        [sortField]: sortOrder,
      })
      .skip(skip)
      .limit(limit);

    const totalTenants = await Tenant.countDocuments(query);

    return res.status(httpStatus.OK).json({
      status: "success",
      message: "Tenants retrieved successfully",
      data: tenants,
      pagination: {
        currentPage: page,
        limit,
        totalTenants,
        totalPages: Math.ceil(totalTenants / limit),
      },
    });
  } catch (error) {
    console.error("Error getting tenants:", error);

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
  export const getTenantById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const tenant = await Tenant.findById(id).populate("apartment");
  
      if (!tenant) {
        return res.status(httpStatus.NOT_FOUND).json({
          status: "error",
          message: "Tenant not found",
        });
      }
  
      // Make sure the tenant's apartment belongs to the logged-in landlord
      if (
        tenant.apartment.landlord.toString() !==
        req.user._id.toString()
      ) {
        return res.status(httpStatus.FORBIDDEN).json({
          status: "error",
          message: "You do not have access to this tenant",
        });
      }
  
      return res.status(httpStatus.OK).json({
        status: "success",
        message: "Tenant retrieved successfully",
        data: tenant,
      });
    } catch (error) {
      console.error("Error getting tenant:", error);
  
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  };

  export const updateTenant = async (req, res) => {
    try {
      const { id } = req.params;
  
      const tenant = await Tenant.findById(id);
  
      if (!tenant) {
        return res.status(httpStatus.NOT_FOUND).json({
          status: "error",
          message: "Tenant not found",
        });
      }
  
      // Check that the tenant belongs to one of the landlord's apartments
      const apartment = await Apartment.findOne({
        _id: tenant.apartment,
        landlord: req.user._id,
      });
  
      if (!apartment) {
        return res.status(httpStatus.FORBIDDEN).json({
          status: "error",
          message: "You do not have access to this tenant",
        });
      }
  
      const updatedTenant = await Tenant.findByIdAndUpdate(
        id,
        { $set: req.body },
        {
          new: true,
          runValidators: true,
        }
      ).populate("apartment");
  
      return res.status(httpStatus.OK).json({
        status: "success",
        message: "Tenant updated successfully",
        data: updatedTenant,
      });
    } catch (error) {
      console.error("Error updating tenant:", error);
  
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  };

  export const deleteTenant = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the tenant
      const tenant = await Tenant.findById(id);
  
      if (!tenant) {
        return res.status(httpStatus.NOT_FOUND).json({
          status: "error",
          message: "Tenant not found",
        });
      }
  
      // Make sure the tenant belongs to an apartment owned by
      // the logged-in landlord
      const apartment = await Apartment.findOne({
        _id: tenant.apartment,
        landlord: req.user._id,
      });
  
      if (!apartment) {
        return res.status(httpStatus.FORBIDDEN).json({
          status: "error",
          message: "You do not have access to this tenant",
        });
      }
  
      // Delete the tenant
      await Tenant.findByIdAndDelete(id);
  
      // Make the apartment vacant again
      apartment.status = "vacant";
      await apartment.save();
  
      return res.status(httpStatus.OK).json({
        status: "success",
        message: "Tenant deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting tenant:", error);
  
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  };

export const uploadTenantDocuments = async (req, res, next) => {
  try {
    console.log("UPLOAD TENANT DOCUMENTS CONTROLLER");
    console.log("Tenant ID:", req.params.id);
    console.log("Files:", req.files);
    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl);

    const { id } = req.params;

    const tenant = await Tenant.findById(id);

    if (!tenant) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Tenant not found",
      });
    }

    // Make sure the tenant belongs to the logged-in landlord
    const apartment = await Apartment.findOne({
      _id: tenant.apartment,
      landlord: req.user._id,
    });

    if (!apartment) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "You do not have access to this tenant",
      });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "No files were uploaded",
      });
    }

    // Passport photo
    if (req.files.passportPhoto) {
      const oldPublicId =
        tenant.identification.passportPhotoPublicId;

      const result = await uploadToCloudinary(
        req.files.passportPhoto[0].buffer,
        "property-management/tenants/passport-photos",
        "image"
      );

      tenant.identification.passportPhotoUrl =
        result.secure_url;

      tenant.identification.passportPhotoPublicId =
        result.public_id;

      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId);
      }
    }

    // ID document
    if (req.files.idDocument) {
      const oldPublicId =
        tenant.identification.idDocumentPublicId;

      const result = await uploadToCloudinary(
        req.files.idDocument[0].buffer,
        "property-management/tenants/id-documents",
        "auto"
      );

      tenant.identification.idDocumentUrl =
        result.secure_url;

      tenant.identification.idDocumentPublicId =
        result.public_id;

      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId);
      }
    }

    // Work ID
    if (req.files.workId) {
      const oldPublicId =
        tenant.identification.workIdPublicId;

      const result = await uploadToCloudinary(
        req.files.workId[0].buffer,
        "property-management/tenants/work-ids",
        "auto"
      );

      tenant.identification.workIdUrl =
        result.secure_url;

      tenant.identification.workIdPublicId =
        result.public_id;

      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId);
      }
    }

    await tenant.save();

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Tenant documents uploaded successfully",
      data: {
        identification: tenant.identification,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    next(error);
  }
};

