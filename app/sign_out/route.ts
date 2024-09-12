import { cookies } from 'next/headers';

export async function DELETE() {
  cookies().delete('_staffplan_redux_session');
  return new Response(JSON.stringify({ message: 'Sign Out Successful' }), {
    status: 200,
  });
}