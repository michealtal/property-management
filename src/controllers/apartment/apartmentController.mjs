import mongoose from "mongoose";
import httpStatus from "http-status";
import Apartment from "../../models/apartmentModel/Apartment.mjs";

export const createApartment = async (req, res) => {
  try {
    const { apartmentNumber, address, type, status } = req.body;

    const apartment = await Apartment.create({
      landlord: req.user._id,
      apartmentNumber,
      address,
      type,
      status,
    });

    return res.status(httpStatus.CREATED).json({
      status: "success",
      message: "Apartment created successfully",
      data: apartment,
    });
  } catch (error) {
    console.error("Error creating apartment:", error);

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export const getApartments = async (req, res) => {
    try {
      const apartments = await Apartment.find({
        landlord: req.user._id,
      });
  
      return res.status(httpStatus.OK).json({
        status: "success",
        message: "Apartments retrieved successfully",
        data: apartments,
      });
    } catch (error) {
      console.error("Error getting apartments:", error);
  
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  };

  export const getApartmentById = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      // Check if the apartment ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid apartment ID",
        });
      }
  
      // Find the apartment
      const apartment = await Apartment.findById(id);
  
      // Check if the apartment exists
      if (!apartment) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: "Apartment not found",
        });
      }
  
      // Return the apartment
      return res.status(httpStatus.OK).json({
        success: true,
        message: "Apartment retrieved successfully",
        data: apartment,
      });
    } catch (error) {
        next(error);
      }
    };

    export const updateApartment = async (req, res, next) => {
        try {
          const { id } = req.params;
      
          // Check if the apartment ID is valid
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(httpStatus.BAD_REQUEST).json({
              success: false,
              message: "Invalid apartment ID",
            });
          }
      
          // Find the apartment
          const apartment = await Apartment.findById(id);
      
          // Check if apartment exists
          if (!apartment) {
            return res.status(httpStatus.NOT_FOUND).json({
              success: false,
              message: "Apartment not found",
            });
          }
      
          // Update the apartment
          const updatedApartment = await Apartment.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
              }
            );
        
            return res.status(httpStatus.OK).json({
              success: true,
              message: "Apartment updated successfully",
              data: updatedApartment,
            });
          } catch (error) {
            next(error);
          }
        };

        export const deleteApartment = async (req, res, next) => {
            try {
              const { id } = req.params;
          
              // Check if the apartment ID is valid
              if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(httpStatus.BAD_REQUEST).json({
                  success: false,
                  message: "Invalid apartment ID",
                });
              }
          
              // Find and delete the apartment
              const apartment = await Apartment.findByIdAndDelete(id);
          
              
              // Check if apartment exists
              if (!apartment) {
                return res.status(httpStatus.NOT_FOUND).json({
                  success: false,
                  message: "Apartment not found",
                });
              }
          
              return res.status(httpStatus.OK).json({
                success: true,
                message: "Apartment deleted successfully",
                data: apartment,
              });
            } catch (error) {
              next(error);
            }
        };