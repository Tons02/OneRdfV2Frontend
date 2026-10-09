import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingButton } from '@/components/shared/animations/LoadingButton'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/api/errors'
import { ROUTES } from '@/lib/constants'
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema'
import { useLogin } from '../hooks/useLogin'

export interface PasswordFieldState {
  /** Focus is on the password input or its show/hide button. */
  focused: boolean
  hasValue: boolean
  visible: boolean
}

interface LoginFormProps {
  /** Lets the page react to password entry (e.g. the mascot). UI only. */
  onPasswordStateChange?: (state: PasswordFieldState) => void
}

export function LoginForm({ onPasswordStateChange }: LoginFormProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? ROUTES.dashboard

  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error } = useLogin()

  const form = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const [passwordFocused, setPasswordFocused] = useState(false)
  const password = useWatch({ control: form.control, name: 'password' })
  const hasPassword = Boolean(password)

  useEffect(() => {
    onPasswordStateChange?.({
      focused: passwordFocused,
      hasValue: hasPassword,
      visible: showPassword,
    })
  }, [onPasswordStateChange, passwordFocused, hasPassword, showPassword])

  const onSubmit = async (values: LoginFormValues) => {
    if (await login(values)) {
      navigate(redirectTo, { replace: true })
    }
  }

  const fieldErrors = getApiFieldErrors(error)
  const serverMessage = error
    ? getApiErrorMessage(error, 'Invalid username or password.')
    : null

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        {serverMessage && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{serverMessage}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  autoCapitalize="none"
                  spellCheck={false}
                  autoComplete="username"
                  placeholder="Enter your username"
                  className="h-10"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage>{fieldErrors.username}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div
                className="relative"
                onFocus={() => setPasswordFocused(true)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setPasswordFocused(false)
                  }
                }}
              >
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-10 pr-10"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 size-10 text-muted-foreground hover:bg-transparent"
                  // Keep focus (and the caret) in the input when toggled with a pointer.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <FormMessage>{fieldErrors.password}</FormMessage>
            </FormItem>
          )}
        />

        <LoadingButton
          type="submit"
          size="lg"
          className="w-full"
          loading={isLoading}
          loadingText="Signing in…"
        >
          Sign in
        </LoadingButton>
      </form>
    </Form>
  )
}
