import {Button} from "@/presentation/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/presentation/components/ui/dialog.tsx";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onGoToDetails: () => void;
}

const ExistingRepairRequestModal = ({ isOpen, onClose, onGoToDetails }: Props) => {
    return (
        <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
            <DialogContent className="sm:max-w-md" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className="text-center">Активна заявка на ремонт</DialogTitle>
                    <DialogDescription className="text-center">
                        Для цього обладнання вже існує заявка на ремонт. Перейти на сторінку з детальною інформацією про поломку?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-center gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Залишитись
                    </Button>
                    <Button onClick={onGoToDetails} className="gap-2">
                        Перейти до заявки
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ExistingRepairRequestModal;
