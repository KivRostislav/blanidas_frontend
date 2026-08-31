import {useCallback, useState} from "react";
import {Building2, CalendarDays, Edit, Mail, MapPin, Phone, Shield, ShieldCheck, User2, Wrench, type LucideIcon} from "lucide-react";

import type { User } from "@/domain/entities/user";
import type { UserUpdate } from "@/domain/models/user";
import type { Institution } from "@/domain/entities/institution";
import type { MutationOptions } from "@/presentation/models";

import EditDeleteActions from "@/presentation/components/layouts/EditDeleteActions";
import FormModal from "@/presentation/components/layouts/FormModal";
import { modalFieldsFactory, type MemberFormData } from "@/presentation/components/tabs/staff/modal.ts";
import { useTimedError } from "@/presentation/hooks/useTimedError";
import { Button } from "@/presentation/components/ui/button";
import {composeMutationOptions} from "@/presentation/utils.ts";
import {errorCodeMap, errorMessages} from "@/presentation/components/tabs/staff/StaffTab.tsx";
import EmptyTable from "@/presentation/components/layouts/EmptyTable.tsx";
import type {RequestError} from "@/infrastructure/errors.ts";
import type { Role } from "@/domain/auth/roles";
import {useAuthSession} from "@/presentation/hooks/auth.ts";

interface Props {
    staff: User[];
    institutions: Institution[];
    update: (member: UserUpdate, options?: MutationOptions) => void;
    delete_?: (id: string, options: MutationOptions) => void;
}

interface BadgeSchema {
    icon: LucideIcon;
    styles: string;
}

const schemes: Record<Role, BadgeSchema> = {
    admin: {
        icon: ShieldCheck,
        styles: "text-cyan-700",
    },
    engineer: {
        icon: Wrench,
        styles: "text-blue-700",
    },
    manager: {
        icon: Shield,
        styles: "text-purple-700",
    },
};


const StaffTable = ({ staff, institutions, update, delete_ }: Props) => {
    const authSession = useAuthSession();
    const isAdmin = authSession?.currentUser.role === "admin";
    const [editingMember, setEditingMember] = useState<User | null>(null);
    const [failedDeletingMemberIds, setFailedDeletingMemberIds] = useTimedError<string[]>([], 5000);
    const [updateError, setUpdateError] = useTimedError<string | null>(null, 5000);

    const onUpdate = (data: MemberFormData, options?: MutationOptions) => {
        if (!editingMember) return;

        update(
            {
                id: editingMember.id,
                role: data.role,
                phone: data.phone,
                email: data.email,
                hireAt: data.hireAt,
                workplaceId: data.workplaceId,
                department: data.department,
                username: `${data.firstName} ${data.lastName}`,
                receiveLowStockNotification: data.receiveLowStockNotification,
                receiveRepairRequestCreatedNotification: data.receiveRepairRequestCreatedNotification,
                password: data.password.trim() || undefined,
            },
            composeMutationOptions({
                onSuccess: () => { setUpdateError(null); },
                onError: onError,
            }, options)
        );
    };

    const onError = (error?: RequestError): void => {
        if (!error) return;

        if (error.code in errorCodeMap) {
            setUpdateError(errorCodeMap[error.code]);
            return;
        }

        setUpdateError(errorMessages.update);
    }

    const onDelete = useCallback((id: string) => {
        if (!delete_) return;
        delete_(id, {
            onSuccess: () => setFailedDeletingMemberIds(prev => prev.filter(x => x !== id)),
            onError: () => setFailedDeletingMemberIds(prev => [...prev, id]),
        });
    }, [delete_, setFailedDeletingMemberIds]);

    const renderActions = useCallback((member: User) => {
        return delete_ ? (
            <EditDeleteActions
                edit={() => setEditingMember(member)}
                delete_={() => onDelete(member.id)}
            />
        ) : (
            <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingMember(member)}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 h-8 w-8 p-0"
            >
                <Edit className="w-4 h-4" />
            </Button>
        );
    }, [delete_, onDelete]);

    return (
        <>
            <div className="md:hidden">
                {staff.length === 0 ? (
                    <EmptyTable title="Співробітників не знайдено" icon={User2}/>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                        {staff.map((member) => {
                            const RoleIcon = schemes[member.role].icon;
                            const roleStyles = schemes[member.role].styles;
                            return (
                                <div key={member.id} className="p-4">
                                    <div className="flex items-center justify-between gap-1">
                                        <div className="min-w-0">
                                            <div className="flex flex-col items-start min-w-0">
                                                <div className="flex gap-1">
                                                    <RoleIcon className={`${roleStyles} w-4 h-4 shrink-0`} />
                                                    <p className="text-sm font-medium text-slate-900 truncate" title={member.username}>
                                                        {member.username?.trim() || "—"}
                                                    </p>
                                                </div>
                                                <span className="text-xs font-medium text-slate-900 truncate">{member.workplace?.name ?? "—"}</span>
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <div className="shrink-0">
                                                {renderActions(member)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Mail className="w-3 h-3 text-slate-400" />
                                            <a href={`mailto:${member.email}`} className="truncate hover:text-cyan-600">
                                                {member.email}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Phone className="w-3 h-3 text-slate-400" />
                                            <span>{member.phoneNumber}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-3 space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            {member.department || "—"}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <CalendarDays className="w-3 h-3 text-slate-400" />
                                            <span>{new Date(member.hireAt).toLocaleDateString("uk-UA")}</span>
                                        </div>
                                    </div>

                                    {failedDeletingMemberIds.includes(member.id) && (
                                        <p className="mt-3 text-xs text-red-700">
                                            {errorMessages.delete}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="hidden md:block">
                {staff.length === 0 ? (
                    <EmptyTable title="Співробітників не знайдено" icon={User2}/>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div className={`grid ${
                            isAdmin
                                ? "grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]"
                                : "grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)]"
                        } gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wider`}>
                            <div>Працівник</div>
                            <div className="hidden lg:block">Місце роботи / Відділ</div>
                            <div className="text-left">Контакти</div>
                            <div className={`${!isAdmin && "text-right"}`}>Дата найму</div>
                            {isAdmin && <div className="text-right">Дії</div>}
                        </div>

                        <div className="divide-y divide-slate-100">
                            {staff.map((member) => {
                                const RoleIcon = schemes[member.role].icon;
                                const roleStyles = schemes[member.role].styles;
                                return (
                                    <div key={member.id}>
                                        <div className={`grid ${
                                            isAdmin
                                                ? "grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]"
                                                : "grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)]"
                                        } gap-4 px-4 py-3 items-center hover:bg-slate-50 transition-colors`}>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <RoleIcon className={`${roleStyles} w-4 h-4 shrink-0`} />
                                                    <p className="text-sm font-medium text-slate-900 truncate" title={member.username}>
                                                        {member.username?.trim() || "—"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="hidden lg:block min-w-0 space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate" title={member.workplace?.name ?? ""}>
                                                        {member.workplace?.name ?? "—"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate" title={member.department}>
                                                        {member.department || "—"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                                    <a href={`mailto:${member.email}`} className="truncate hover:text-cyan-600">
                                                        {member.email}
                                                    </a>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                                    <span className="truncate">{member.phoneNumber}</span>
                                                </div>
                                            </div>

                                            <div className={`${!isAdmin && "text-right"} text-sm text-slate-600`}>
                                                {new Date(member.hireAt).toLocaleDateString("uk-UA")}
                                            </div>

                                            {isAdmin && (
                                                <div className="flex items-center justify-end">
                                                    {renderActions(member)}
                                                </div>
                                            )}
                                        </div>

                                        {failedDeletingMemberIds.includes(member.id) && (
                                            <div className="px-4 pb-3">
                                                <p className="text-xs text-red-700">
                                                    {errorMessages.delete}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {editingMember && (
                <FormModal
                    isOpen
                    close={() => setEditingMember(null)}
                    title="Редагувати працівника"
                    description="Внесіть зміни до інформації про працівника"
                    fields={modalFieldsFactory(institutions, false)}
                    submit={onUpdate}
                    submitText="Зберегти зміни"
                    errors={updateError ? [updateError] : []}
                    initialValues={{
                        firstName: editingMember.username.split(" ")[0],
                        lastName: editingMember.username.split(" ")[1] ?? "",
                        email: editingMember.email,
                        password: "",
                        phone: editingMember.phoneNumber,
                        hireAt: editingMember.hireAt,
                        department: editingMember.department,
                        workplaceId: editingMember.workplace?.id ?? "",
                        role: editingMember.role,
                        receiveLowStockNotification: editingMember.receiveLowStockNotification,
                        receiveRepairRequestCreatedNotification:
                        editingMember.receiveRepairRequestCreatedNotification,
                    }}
                />
            )}
        </>
    );
};

export default StaffTable;
