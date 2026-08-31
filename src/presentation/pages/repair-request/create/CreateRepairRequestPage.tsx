import CreateRepairRequestForm from "@/presentation/pages/repair-request/create/CreateRepairRequestForm.tsx";
import DeviceInfoPanel from "@/presentation/pages/repair-request/create/DeviceInfoPanel.tsx";
import {Route} from "@/presentation/routes/repair-request/$equipmentId.tsx"
import type {Urgency} from "@/domain/entities/repair-request.ts";
import RequestSuccess from "@/presentation/pages/repair-request/create/RequestSuccess.tsx";
import BaseLayout from "@/presentation/components/layouts/BaseLayout.tsx";
import {useEquipmentById} from "@/presentation/hooks/entities/equipment.ts";
import {
    useActiveRepairRequestByEquipmentId,
    useCreateRepairRequest
} from "@/presentation/hooks/entities/repair-request.ts";
import Notification from "@/presentation/components/layouts/Notification.tsx";
import EquipmentNotFound from "@/presentation/pages/repair-request/create/EquipmentNotFound.tsx";
import {useTimedError} from "@/presentation/hooks/useTimedError.ts";
import {useAuthSession} from "@/presentation/hooks/auth.ts";
import ExistingRepairRequestModal from "@/presentation/pages/repair-request/create/ExistingRepairRequestModal.tsx";
import {useEffect, useState} from "react";

interface RepairRequestFormData {
    description: string;
    urgencyLevel: Urgency;
    photos: string[];
}

const CreateRepairRequestPage = () => {
    const { equipmentId } = Route.useParams();
    const navigate = Route.useNavigate();
    const session = useAuthSession();
    const isLoggedIn = !!session;

    const [showCreateRepairRequestErrorMessage, setShowCreateRepairRequestErrorMessage] = useTimedError<boolean>(false, 5000);
    const [showExistingRepairRequestModal, setShowExistingRepairRequestModal] = useState(false);

    const equipment = useEquipmentById(equipmentId);
    const createRepairRequest = useCreateRepairRequest();
    const { data: activeRepairRequest } = useActiveRepairRequestByEquipmentId(equipmentId, isLoggedIn);

    useEffect(() => {
        if (isLoggedIn && activeRepairRequest) {
            setShowExistingRepairRequestModal(true);
        }
    }, [isLoggedIn, activeRepairRequest]);

    const goToRepairRequestDetails = () => {
        if (!activeRepairRequest) return;

        void navigate({
            to: "/dashboard/repair-requests/$repairRequestId",
            params: { repairRequestId: activeRepairRequest.id },
        });
    };

    const sendForm = (data: RepairRequestFormData) => {
        createRepairRequest.mutate({
            ...data,
            equipmentId: equipmentId,
        }, {
            onSuccess: () => setShowCreateRepairRequestErrorMessage(false),
            onError: () => setShowCreateRepairRequestErrorMessage(true),
        })
    }

    return (
        <BaseLayout>
            <ExistingRepairRequestModal
                isOpen={showExistingRepairRequestModal}
                onClose={() => setShowExistingRepairRequestModal(false)}
                onGoToDetails={goToRepairRequestDetails}
            />
            {equipment.isError
                ? <EquipmentNotFound />
                : (
                    <>
                        {createRepairRequest.isSuccess
                            ? <RequestSuccess repairRequestId={createRepairRequest.data.id.toString()} />
                            : (
                                <div className="space-y-6">
                                    <DeviceInfoPanel equipment={equipment.isLoading ? null : equipment.data!} isLoading={equipment.isLoading} />
                                    <CreateRepairRequestForm
                                        sendForm={sendForm}
                                        isLoading={equipment.isLoading}
                                        isSubmitting={createRepairRequest.isPending}
                                    />
                                    {showCreateRepairRequestErrorMessage &&
                                        <Notification type="error" message="На жаль, заявку зараз подати не вдалося. Спробуйте, будь ласка, пізніше" />
                                    }
                                </div>
                            )
                        }
                    </>
                )
            }
        </BaseLayout>
    )
}

export default CreateRepairRequestPage;
export type { RepairRequestFormData };