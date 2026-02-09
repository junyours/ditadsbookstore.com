import { Button } from "@/components/ui/button";
import StoreLayout from "@/layouts/store-layout";
import { ReactPortal } from "react";
import Facebook from "../../../../public/images/icons/facebook.png";
import Google from "../../../../public/images/icons/google.png";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useForm, usePage } from "@inertiajs/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";

export default function Login() {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        email: "",
        password: "",
    });

    const handleLogin = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        clearErrors();
        post(route("login"));
    };
    const { flash } = usePage().props;

    return (
        <div className="max-w-xs mx-auto flex flex-col justify-center gap-8">
            {flash.error && (
                <Alert variant="destructive">
                    <AlertCircle className="size-5" strokeWidth={1.5} />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
            )}
            <h1 className="font-bold text-2xl text-center uppercase">
                Sign in to your account
            </h1>
            <div className="flex flex-col gap-4">
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label>Email</Label>
                        <Input
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            type="email"
                        />
                        <InputError message={errors.email} />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label>Password</Label>
                        <Input
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            type="password"
                        />
                        <InputError message={errors.password} />
                    </div>
                    <Button disabled={processing}>
                        {processing && <Loader2 className="animate-spin" />}
                        {processing ? "Logging in" : "Log in"}
                    </Button>
                </form>
                <p className="font-semibold text-center text-sm">
                    Or
                </p>
                <a href={route("social.redirect", "google")}>
                    <Button variant="secondary" className="w-full">
                        <img src={Google} alt="google" className="size-5" />
                        <span className="font-semibold">Sign in with Google</span>
                    </Button>
                </a>
                {/* <div className="grid grid-cols-2 gap-4">
                    <a href={route("social.redirect", "facebook")}>
                    <Button variant="secondary" className="w-full">
                        <img src={Facebook} alt="facebook" className="size-5" />
                        <span className="font-semibold">Facebook</span>
                    </Button>
                    </a>
                    <a href={route("social.redirect", "google")}>
                        <Button variant="secondary" className="w-full">
                            <img src={Google} alt="google" className="size-5" />
                            <span className="font-semibold">Google</span>
                        </Button>
                    </a>
                </div> */}
            </div>
        </div>
    );
}

Login.layout = (page: ReactPortal) => <StoreLayout children={page} />;
