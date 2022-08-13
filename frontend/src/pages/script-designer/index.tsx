import React, { useState } from "react";
import { RootState } from "../../state";
import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { IUser } from "../../data/storage-proxy/auth-proxy";
import { Workbench } from "./workbench/workbench";
import "./styles.css";

export function ScriptDesignerPage(): JSX.Element {
    // redux
    const chainId: string | undefined = useSelector((state: RootState) => state.wallet.chainId);
    const user: IUser | undefined = useSelector((state: RootState) => state.wallet.user);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);
    const workbenchScripts = useSelector((state: RootState) => state.workbench.scripts);

    // states
    const [redirectToReview, setRedirectToReview] = useState<boolean>(false);

    if (!user || !chainId || user.banned || !supportedChain) return <Navigate to="/my-page" />;
    if (redirectToReview) return <Navigate to="/review" />;

    return (
        <div className="designer">
            <Workbench chainId={chainId} setRedirectToReview={setRedirectToReview} />

            {/* A link to the review page */}
            <Link
                className={`designer__review-link ${
                    workbenchScripts.length === 0 ? "designer__review-link--disabled" : ""
                }`}
                to={workbenchScripts.length > 0 ? "/review" : "#"}
            >
                Review ({workbenchScripts.length})
            </Link>
        </div>
    );
}
