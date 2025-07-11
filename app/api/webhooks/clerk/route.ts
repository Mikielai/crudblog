import { WebhookEvent } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@/lib/db'

const webhookSecret: string = process.env.CLERK_WEBHOOK_SIGNING_SECRET!

export async function POST(req: Request) {
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(webhookSecret)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  const { id } = evt.data
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, image_url, last_name } = evt.data
    try {
      const newEvent = await db.user.create({
        data: {
          id: id, // ✅ This uses the id variable
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
          profileimage: image_url,
        },
      })
      return new Response(JSON.stringify(newEvent), {
        status: 201,
      })
    } catch (err) {
      console.error('Error: Failed to store event in the database:', err)
      return new Response('Error: Failed to store event in the database', {
        status: 500,
      })
    }
  }

  return new Response('Webhook received', { status: 200 })
}
