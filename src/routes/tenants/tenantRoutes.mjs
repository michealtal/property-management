import express from "express";

import { createTenant, getTenants,getTenantById , updateTenant, deleteTenant, uploadTenantDocuments} from "../../controllers/tenants/tenantsController.mjs";

import { createTenantSchema, tenantQuerySchema, updateTenantSchema } from "../../schemas/tenants/tenants.mjs";

import { validationMiddleware } from "../../middleware/validation.mjs";

import { verifyUser } from "../../middleware/verifyUser.mjs";

import upload from "../../middleware/upload.mjs";

const router = express.Router();

router.post(
  "/",
  verifyUser,
  validationMiddleware(createTenantSchema),
  createTenant
);

router.get(
    "/",
    verifyUser,
    validationMiddleware(tenantQuerySchema, "QUERY"),
    getTenants
  );

  router.get(
    "/:id",
    verifyUser,
    getTenantById
  );

  router.patch(
    "/:id/documents",
    verifyUser,
    upload.fields([
      { name: "passportPhoto", maxCount: 1 },
      { name: "idDocument", maxCount: 1 },
      { name: "workId", maxCount: 1 },
    ]),
    uploadTenantDocuments
  );

  router.patch(
    "/:id",
    verifyUser,
    validationMiddleware(updateTenantSchema),
    updateTenant
  );

  router.delete(
    "/:id",
    verifyUser,
    deleteTenant
  );
export default router;