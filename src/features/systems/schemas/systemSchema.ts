import * as yup from 'yup'

// Mirrors SystemRequest. Unique name and existing category are checked by the
// backend (422 → field errors). Pass `context: { isEdit }` to useForm: the
// token is required on create; on edit a blank token keeps the stored one.

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
const MAX_IMAGE_BYTES = 2048 * 1024 // max:2048 (KB)

const text = (label: string) =>
  yup.string().trim().required(`${label} is required`).max(255, `${label} must be at most 255 characters`)

const image = (label: string) =>
  yup
    .mixed<File>()
    .nullable()
    .default(null)
    .test('type', `${label} must be a JPEG, PNG, GIF or SVG image`, (file) => !file || IMAGE_TYPES.includes(file.type))
    .test('size', `${label} must be 2 MB or smaller`, (file) => !file || file.size <= MAX_IMAGE_BYTES)

export const systemSchema = yup.object({
  name: text('Name'),
  description: text('Description'),
  system_category_id: yup.string().required('System category is required'),
  frontend_url: text('Frontend URL'),
  backend_url: text('Backend URL'),
  token: yup
    .string()
    .trim()
    .max(255, 'Token must be at most 255 characters')
    .when('$isEdit', {
      is: true,
      then: (schema) => schema.default(''),
      otherwise: (schema) => schema.required('Token is required'),
    })
    .default(''),
  logo: image('Logo'),
  background: image('Background'),
  login_endpoint: text('Login endpoint'),
  create_user_endpoint: text('Create user endpoint'),
  pending_user_endpoint: text('Pending user endpoint'),
  update_user_endpoint: text('Update user endpoint'),
  reset_password_endpoint: text('Reset password endpoint'),
  change_password_endpoint: text('Change password endpoint'),
  charging_of_account_endpoint: text('Charging of account endpoint'),
  account_title_endpoint: text('Account title endpoint'),
})

export type SystemFormValues = yup.InferType<typeof systemSchema>
