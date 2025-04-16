import * as yup from 'yup';

// export const addNoteWorklogSchema = yup.object().shape({
//   note: yup.string().required('Note is required'),
//   issue: yup.string().optional(),
//   resources: yup.array().of(
//     yup.object().shape({
//       resourceID: yup.number().default(0),
//       description: yup.string().default(''),
//       resourceURL: yup.string().required(),
//       fileFormat: yup.string().default('image/jpeg'),
//       file: yup.string().default(''),
//     })
//   ).optional(),
// });

export const worklogNoteSchemas = {
  note: yup
    .string()
    .required('Note is required')
    .min(5, 'Note must be at least 5 characters')
    .max(1000, 'Note cannot exceed 1000 characters'),

  issue: yup
    .string()
    .max(100, 'Issue cannot exceed 100 characters'),

  resources: yup
    .array()
    .of(
      yup.object({
        uri: yup.string().required('Image URI is required'),
        type: yup
          .string()
          .required('Image type is required')
          .matches(
            /^image\/(jpeg|png|gif)$/,
            'Image must be JPEG, PNG, or GIF'
          ),
        name: yup
          .string()
          .required('Image name is required')
          .matches(/\.(jpg|jpeg|png|gif)$/i, 'Image name must end with .jpg, .jpeg, .png, or .gif'),
        
      })
    )
    .max(5, 'Maximum 5 images allowed'),
};

export const addNoteWorklogSchema = yup.object({
  note: worklogNoteSchemas.note,
  issue: worklogNoteSchemas.issue,
  resources: worklogNoteSchemas.resources,
});

export const editNoteWorklogSchema = yup.object({
  note: worklogNoteSchemas.note,
  issue: worklogNoteSchemas.issue,
  resources: worklogNoteSchemas.resources,
});