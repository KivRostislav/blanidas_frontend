import {RepairRequestRepository} from "@/dependencies.ts";
import {
    createRepairRequestUseCase, deleteRepairRequestUseCase, getRepairRequestUseCase,
    listRepairRequestsUseCase,
    updateRepairRequestUseCase
} from "@/domain/useCases/repair-request.ts";
import {createCrudHooks} from "@/presentation/hooks/entities/factory.ts";
import {useQuery} from "@tanstack/react-query";

const useRepairRequestById = (id: string) => {
    return useQuery({
        queryKey: ['repair-request', id],
        queryFn: () => getRepairRequestUseCase(RepairRequestRepository)(id)
    })
}

const useActiveRepairRequestByEquipmentId = (equipmentId: string, enabled: boolean) => {
    const listFn = listRepairRequestsUseCase(RepairRequestRepository);
    const query = {
        pagination: { page: 1, limit: 1 },
        filters: { equipmentId },
        sorting: { sortBy: "date" as const, sortOrder: "desc" as const },
    };

    return useQuery({
        queryKey: ['repair-request', 'active-by-equipment', equipmentId],
        queryFn: () => listFn(query),
        enabled: enabled && !!equipmentId,
        select: (data) => data.items.find(request => request.lastStatus !== "finished") ?? null,
    });
}

const repairRequestHooks = createCrudHooks(
    "repair-request",
    listRepairRequestsUseCase(RepairRequestRepository),
    createRepairRequestUseCase(RepairRequestRepository),
    updateRepairRequestUseCase(RepairRequestRepository),
    deleteRepairRequestUseCase(RepairRequestRepository)
);

const useRepairRequests = repairRequestHooks.useList;
const useCreateRepairRequest = repairRequestHooks.useCreate;
const useUpdateRepairRequest = repairRequestHooks.useUpdate;
const useDeleteRepairRequest = repairRequestHooks.useDelete;

export {
    useRepairRequests,
    useCreateRepairRequest,
    useUpdateRepairRequest,
    useDeleteRepairRequest,
    useRepairRequestById,
    useActiveRepairRequestByEquipmentId,
};