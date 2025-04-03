import * as yup from 'yup';

export const noteSchemas = {
  content: yup
    .string()
    .required('Note content is required')
    .min(5, 'Note must be at least 5 characters')
    .max(1000, 'Note cannot exceed 1000 characters'),

  issueName: yup
    .string()
    .max(100, 'Issue name cannot exceed 100 characters'),

  images: yup
    .array()
    .of(yup.string().url('Invalid image URL').required())
    .max(5, 'Maximum 5 images allowed'),
};

export const addNoteSchema = yup.object({
  content: noteSchemas.content,
  issueName: noteSchemas.issueName,
  images: noteSchemas.images,
});

export const editNoteSchema = yup.object({
  content: noteSchemas.content,
  issueName: noteSchemas.issueName,
  images: noteSchemas.images,
});