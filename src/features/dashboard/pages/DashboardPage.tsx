import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppSelector } from '@/app/store/hooks'
import { selectCurrentUser } from '@/features/auth'

export function DashboardPage() {
  const user = useAppSelector(selectCurrentUser)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Welcome{user ? `, ${user.first_name}` : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is your One RDF dashboard. Build out modules here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
