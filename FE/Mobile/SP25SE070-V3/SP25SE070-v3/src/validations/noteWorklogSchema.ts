import * as yup from 'yup';

export const addNoteWorklogSchema = yup.object().shape({
  note: yup.string().required('Note is required'),
  issue: yup.string().optional(),
  resources: yup.array().of(
    yup.object().shape({
      resourceID: yup.number().default(0),
      description: yup.string().default(''),
      resourceURL: yup.string().required(),
      fileFormat: yup.string().default('image/jpeg'),
      file: yup.string().default(''),
    })
  ).optional(),
});