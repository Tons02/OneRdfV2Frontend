import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppSelector } from '@/hooks/useAppDispatch'

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Welcome{user ? `, ${user.name}` : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is your OneRDF dashboard. Build out modules here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
