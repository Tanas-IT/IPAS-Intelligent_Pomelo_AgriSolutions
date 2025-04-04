import * as yup from 'yup';

export const harvestRecordSchema = yup.object().shape({
  masterTypeId: yup.number().required('Product type is required').min(1),
  harvestHistoryId: yup.number().required('Harvest session is required').min(1),
  quantity: yup
    .number()
    .typeError('Quantity must be a number')
    .min(0.1, 'Quantity must be greater than 0')
    .required('Quantity is required'),
});