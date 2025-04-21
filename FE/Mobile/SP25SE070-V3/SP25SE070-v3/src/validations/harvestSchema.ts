import * as yup from "yup";

export const harvestRecordSchema = yup.object().shape({
  masterTypeId: yup
    .number()
    .required("Product type is required")
    .min(1, "Product type is required"),
  harvestHistoryId: yup
    .number()
    .required("Harvest Day is required")
    .min(1, "Harvest Day is required"),
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .required("Quantity is required"),
});

export const harvestUpdateRecordSchema = yup.object().shape({
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .required("Quantity is required"),
});
