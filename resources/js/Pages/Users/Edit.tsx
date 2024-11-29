import {Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator} from "@/Components/ui/breadcrumb";
import {Card, CardContent, CardHeader, CardTitle} from "@/Components/ui/card";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {Head, Link, useForm} from "@inertiajs/react";
import {FormEventHandler} from "react";
import {toast} from "@/hooks/use-toast";
import {Input} from "@/Components/ui/input";
import {Button} from "@/Components/ui/button";
import {User} from "@/types/User";

export default function Edit({user}: { user: User }) {

    const {data, setData, patch, errors, processing, recentlySuccessful} =
        useForm({
            name: user.name,
            email: user.email,
            password: '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('users.update', [user.id]));

        toast({
            title: 'User Updated',
            description: 'User has been updated successfully',
        })
    };


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
                    <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                        <Link href={route('users.edit', [user.id])}>Edit {user.name}</Link>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        }>
        <Head title="Users"/>

        <div className="py-12">
            <Card className={"mx-12"}>
                <CardHeader>
                    <CardTitle>Edit User: {user.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <Input name={"name"} placeholder={"Name"} value={data.name.toString()}
                               onChange={(e) => setData('name', e.target.value)}/>
                        <Input name={"email"} placeholder={"Email"} value={data.email.toString()}
                               onChange={(e) => setData('email', e.target.value)}/>
                        <Input name={"password"} placeholder={"Password"} value={data.password}
                               type={"password"}
                               onChange={(e) => setData('password', e.target.value)}/>
                        <Button type={"submit"}>Update</Button>
                    </form>
                </CardContent>
            </Card>
        </div>

    </AuthenticatedLayout>
}