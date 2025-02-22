import React from "react";
import { Blocker, Transition } from "history";
import { UNSAFE_NavigationContext, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export function useNavigationUnsavedChangesDialog(when: boolean, onSuccess: () => void):
    {
        navigationWasBlocked: boolean,
        handleCancel: () => void,
        handleOk: () => void
    } {

    const [nextLocation, setNextLocation] = React.useState<any | undefined>();
    const { navigator } = React.useContext(UNSAFE_NavigationContext);

    const navigate = useNavigate();

    const handleCancel = () => {
        setNextLocation(undefined);
    };

    const handleOk = () => {
        onSuccess();
        setNextLocation(undefined);
        navigate(-1);
    };

    const blocker: Blocker = ({ action, location: nextLocation, retry }) => {
        switch (action) {
            case "REPLACE": {
                retry();
                return;
            }
            case "POP": {
                setNextLocation(nextLocation);
                return;
            }
        }
    };

    React.useEffect(() => {
        if (!when) return;
        if (nextLocation) return;
        if (!("block" in navigator)) return;
        let unblock = (navigator as any).block((tx: Transition) => {
            let autoUnblockingTx = {
                ...tx,
                retry() {
                    unblock();
                    tx.retry();
                }
            };
            blocker(autoUnblockingTx);
        });

        return unblock;
    }, [navigator, blocker, when]);

    return { navigationWasBlocked: Boolean(nextLocation), handleCancel, handleOk };
}

export interface UnsavedChangesDialogProps {
    open: boolean;
    schemaName: string;
    handleOk: () => void;
    handleCancel: () => void;
}

export function UnsavedChangesDialog({
                                         open,
                                         handleOk,
                                         handleCancel,
                                         schemaName
                                     }: UnsavedChangesDialogProps) {

    return (
        <Dialog
            open={open}
            onClose={handleCancel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"Unsaved changes"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    You have unsaved changes in this {schemaName}. Are you sure
                    you want to leave this page?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} autoFocus> Cancel </Button>
                <Button onClick={handleOk}> Ok </Button>
            </DialogActions>
        </Dialog>
    );
}
