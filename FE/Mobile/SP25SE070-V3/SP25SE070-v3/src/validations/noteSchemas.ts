import * as yup from "yup";

export const noteSchemas = {
  content: yup
    .string()
    .required("Note content is required")
    .min(5, "Note must be at least 5 characters")
    .max(1000, "Note cannot exceed 1000 characters"),

  issueName: yup
    .string()
    .required("Issue name is required")
    .min(5, "Issue name must be at least 5 characters")
    .max(100, "Issue name cannot exceed 100 characters"),

  images: yup
    .array()
    .of(
      yup.object({
        uri: yup.string().required("Image URI is required"),
        type: yup
          .string()
          .required("Image type is required")
          .matches(
            /^image\/(jpeg|png|gif)$/,
            "Image must be JPEG, PNG, or GIF"
          ),
        name: yup
          .string()
          .required("Image name is required")
          .matches(
            /\.(jpg|jpeg|png|gif)$/i,
            "Image name must end with .jpg, .jpeg, .png, or .gif"
          ),
      })
    )
    .max(5, "Maximum 5 images allowed"),
  videos: yup
    .array()
    .of(
      yup.object({
        uri: yup.string().required("Video URI is required"),
        type: yup
          .string()
          .required("Video type is required")
          .matches(
            /^video\/(mp4|avi|mov|mkv)$/,
            "Video must be MP4, AVI, MOV, or MKV"
          ),
        name: yup
          .string()
          .required("Video name is required")
          .matches(
            /\.(mp4|avi|mov|mkv)$/i,
            "Video name must end with .mp4, .avi, .mov, or .mkv"
          ),
      })
    )
    .max(3, "Maximum 3 videos allowed"), // Can be adjusted based on your needs
};

export const addNoteSchema = yup.object({
  content: noteSchemas.content,
  issueName: noteSchemas.issueName,
  images: noteSchemas.images,
  videos: noteSchemas.videos,
});

export const editNoteSchema = yup.object({
  content: noteSchemas.content,
  issueName: noteSchemas.issueName,
  images: noteSchemas.images,
  videos: noteSchemas.videos,
});
