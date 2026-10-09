import * as yup from 'yup'

// Mirrors SystemCategoryRequest: name required string (unique is checked by the
// backend and surfaces as a 422 field error). 255 = the `name` varchar column.
export const systemCategorySchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .max(255, 'Name must be at most 255 characters'),
})

export type SystemCategoryFormValues = yup.InferType<typeof systemCategorySchema>
