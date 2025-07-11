import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET

  if (!webhookSecret) {
    throw new Error(
      'Please add CLERK_WEBHOOK_SIGNING_SECRET from Clerk Dashboard to .env or .env.local'
    )
  }

  const wh = new Webhook(webhookSecret)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Handle the webhook
  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    try {
      const newUser = await db.user.create({
        data: {
          id: id, // ✅ Now using the id variable
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
          profileimage: image_url,
        },
      })

      console.log('User created:', newUser.id)
      return new Response(JSON.stringify(newUser), {
        status: 201,
      })
    } catch (err) {
      console.error('Error: Failed to store user in the database:', err)
      return new Response('Error: Failed to store user in the database', {
        status: 500,
      })
    }
  }

  return new Response('Webhook received', { status: 200 })
}
