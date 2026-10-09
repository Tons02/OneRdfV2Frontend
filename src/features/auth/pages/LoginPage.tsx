import { useState } from 'react'
import { APP_NAME } from '@/lib/constants'
import { LoginForm, type PasswordFieldState } from '../components/LoginForm'
import { LoginMascot, type MascotExpression } from '../components/LoginMascot'

function mascotExpressionFor({ focused, hasValue, visible }: PasswordFieldState): MascotExpression {
  if (!focused) return 'idle'
  // Eyes closed only while a *hidden* password is being entered; if the user
  // reveals it, or hasn't typed yet, the mascot just watches the form.
  return hasValue && !visible ? 'eyes-closed' : 'watching'
}

export function LoginPage() {
  const [passwordState, setPasswordState] = useState<PasswordFieldState>({
    focused: false,
    hasValue: false,
    visible: false,
  })

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-1 w-10 rounded-full bg-primary" aria-hidden />
          <h1 className="text-2xl lg:text-3xl">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back. Enter your credentials to access {APP_NAME}.
          </p>
        </div>
        <LoginMascot expression={mascotExpressionFor(passwordState)} className="-mb-2" />
      </div>
      <LoginForm onPasswordStateChange={setPasswordState} />
    </div>
  )
}
