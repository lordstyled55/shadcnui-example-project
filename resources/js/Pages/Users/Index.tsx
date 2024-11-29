import {Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator} from "@/Components/ui/breadcrumb";
import {Button, buttonVariants} from "@/Components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/Components/ui/card";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {Head, Link, router} from "@inertiajs/react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/Components/ui/table";
import {User} from "@/types/User";
import {toast} from "@/hooks/use-toast";

export default function Index({users}: {
    users: User[]
}) {
    function deleteUser(id: Number) {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('users.destroy', {id}));
            toast({
                title: "User deleted",
                description: "The user has been deleted successfully",
            })
        }
    }

    return <AuthenticatedLayout
        header={
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <Link href={route('users.index')}>Users</Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                        <Link href={route('users.index')}>List</Link>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        }>
        <Head title="Users"/>

        <div className="py-12">
            <Card className={"mx-12"}>
                <CardHeader>
                    <CardTitle>Users List</CardTitle>
                    <CardDescription>
                        <Link className={buttonVariants({variant: "secondary"})}
                              href={route('users.create')}>Create</Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.flatMap(
                                (user: User) => {
                                    return (<TableRow key={user.id.toString()}>
                                        <TableCell className="font-medium">{user.id.toString()}</TableCell>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="text-right">
                                            <Link className={buttonVariants({variant: "outline"})}
                                                  href={route('users.edit', [user.id])}>Edit</Link>
                                            <Button onClick={() => deleteUser(user.id)} type="button"
                                                    className={"ml-2"}
                                                    variant={"destructive"}>Delete</Button>
                                        </TableCell>
                                    </TableRow>)
                                })
                            }
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

    </AuthenticatedLayout>
}