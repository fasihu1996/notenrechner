import { login, signup } from './actions'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  return (
    <form>
      <Label htmlFor="email">Email:</Label>
      <Input id="email" name="email" type="email" required />
      <Label htmlFor="password">Password:</Label>
      <Input id="password" name="password" type="password" required />
      <Button formAction={login}>Log in</Button>
      <Button formAction={signup}>Sign up</Button>
    </form>
  )
}