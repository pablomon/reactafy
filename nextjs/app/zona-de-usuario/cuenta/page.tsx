import { redirect } from "next/navigation";

import AccountDetailsForm from "@/components/account/AccountDetailsForm";
import PasswordForm from "@/components/account/PasswordForm";
import { getMe } from "@/services/accountService";
import { loginUrl } from "@/services/loginRedirect";
import styles from "../account.module.css";

// Datos de la cuenta: nombre, email y contraseña.
// (El layout ya pide /me para el menú; Next memoiza fetch idénticos
// solo si se pueden cachear, y este no se cachea: son dos peticiones.)
export default async function AccountDetailsPage() {
    const me = await getMe();

    if (!me.ok) {
        redirect(await loginUrl());
    }

    return (
        <>
            <h1 className={styles.title}>Cuenta</h1>

            <AccountDetailsForm user={me.data} />
            <PasswordForm />
        </>
    );
}
