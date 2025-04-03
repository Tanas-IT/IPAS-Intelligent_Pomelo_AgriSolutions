import * as Yup from 'yup';

export const reportSchema = Yup.object().shape({
  description: Yup.string().required('Description is required'),
  questionOfUser: Yup.string().required('Question is required'),
});