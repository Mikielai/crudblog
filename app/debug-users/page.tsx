import { syncSpecificUser, getAllUsers } from "@/lib/user-management";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

async function handleSyncUser(formData: FormData) {
  'use server'
  
  const userId = formData.get('userId') as string;
  if (userId) {
    const result = await syncSpecificUser(userId);
    console.log('Sync result:', result);
  }
  redirect('/debug-users');
}

export default async function DebugUsersPage() {
  const usersResult = await getAllUsers();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">User Debug Page</h1>
      
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Sync Specific User</h2>
        <form action={handleSyncUser} className="flex gap-2">
          <input 
            name="userId" 
            placeholder="Enter Clerk User ID" 
            defaultValue="user_2zgwndxcd6ZDXJus6ajZqYePVpQ"
            className="flex-1 px-3 py-2 border rounded"
          />
          <Button type="submit">Sync User</Button>
        </form>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4">All Users in Database</h2>
        {usersResult.success ? (
          <div className="space-y-4">
            {usersResult.users?.map((user) => (
              <div key={user.id} className="p-4 border rounded-lg">
                <div><strong>ID:</strong> {user.id}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Name:</strong> {user.firstName} {user.lastName}</div>
                <div><strong>Posts:</strong> {user.posts?.length || 0}</div>
              </div>
            ))}
            {usersResult.users?.length === 0 && (
              <p className="text-gray-500">No users found in database</p>
            )}
          </div>
        ) : (
          <p className="text-red-500">Error loading users: {usersResult.message}</p>
        )}
      </div>
    </div>
  );
}
