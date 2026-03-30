import { Button } from '@shared/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@shared/ui/dialog';
import { Label } from '@shared/ui/label';
import { Switch } from '@shared/ui/switch';
import { useEffect, useState } from 'react';
import { AlertCircle, Send } from 'react-feather';

type MainnetWarningDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    onCancel: () => void;
    approvedAccounts?: string[];
    matchedAccount?: string | null;
};

export function MainnetWarningDialog({
    open,
    onOpenChange,
    onConfirm,
    onCancel,
    approvedAccounts = [],
    matchedAccount,
}: MainnetWarningDialogProps) {
    const [hasManualApproval, setHasManualApproval] = useState(false);
    const whitelistEnabled = approvedAccounts.length > 0;
    const manualApprovalDisabled = whitelistEnabled && !matchedAccount;
    const confirmDisabled = whitelistEnabled && (!matchedAccount || !hasManualApproval);
    const manualApprovalLabel = matchedAccount
        ? 'I have manually reviewed the matched account above and confirm it is approved.'
        : 'A whitelisted account must be present to proceed.';

    useEffect(() => {
        if (!open) {
            setHasManualApproval(false);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="e-flex e-items-center e-gap-2">
                        <AlertCircle className="e-text-destructive" size={16} />
                        Spend real funds?
                    </DialogTitle>
                </DialogHeader>
                <div className="e-space-y-2 e-pl-6">
                    <DialogDescription>
                        You&apos;re connected to Mainnet. Any SOL you send now is permanent and costs real money. Make
                        sure the details are correct before continuing.
                    </DialogDescription>
                    <p className="e-text-sm e-text-neutral-400">
                        Please take note that this is a beta version feature and is provided on an &quot;as is&quot; and
                        &quot;as available&quot; basis. Solana Explorer does not provide any warranties and will not be
                        liable for any loss, direct or indirect, through continued use of this feature.
                    </p>
                    {whitelistEnabled && (
                        <div className="e-space-y-2 e-rounded-md e-border e-border-neutral-800 e-bg-neutral-900/60 e-p-3">
                            <p className="e-text-xs e-font-semibold e-text-neutral-300">Whitelisted accounts</p>
                            <ul className="e-space-y-1">
                                {approvedAccounts.map(account => (
                                    <li key={account} className="e-text-xs e-text-neutral-400">
                                        <span className="e-font-mono">{account}</span>
                                    </li>
                                ))}
                            </ul>
                            {matchedAccount ? (
                                <p className="e-text-xs e-text-emerald-400">
                                    Matched account: <span className="e-font-mono">{matchedAccount}</span>
                                </p>
                            ) : (
                                <p className="e-text-xs e-text-destructive">
                                    No whitelisted account was detected in the instruction.
                                </p>
                            )}
                        </div>
                    )}
                    {whitelistEnabled && (
                        <div className="e-flex e-items-center e-gap-3">
                            <Switch
                                id="manual-approval"
                                checked={hasManualApproval}
                                disabled={manualApprovalDisabled}
                                onCheckedChange={setHasManualApproval}
                            />
                            <Label htmlFor="manual-approval" className="e-text-xs e-text-neutral-300">
                                {manualApprovalLabel}
                            </Label>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" size="sm" onClick={onCancel}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button variant="destructive" size="sm" onClick={onConfirm} disabled={confirmDisabled}>
                        <Send size={12} />
                        Yes, spend real funds
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
