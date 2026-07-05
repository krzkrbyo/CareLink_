"use client";

import { useMemo, useState, useTransition } from "react";
import { createFoodRule, updateFoodRule } from "@/app/actions/caregiver";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { FoodRule } from "@/types/database";

interface FoodRuleFormProps {
  elderId: string;
  editing?: FoodRule | null;
  onSuccess?: (message: string) => void;
  onCancelEdit?: () => void;
}

export function FoodRuleForm({ elderId, editing, onSuccess, onCancelEdit }: FoodRuleFormProps) {
  const defaults = useMemo(
    () => ({
      type: (editing?.type ?? "prohibited") as FoodRule["type"],
      label: editing?.label ?? "",
    }),
    [editing]
  );

  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<FoodRule["type"]>(defaults.type);
  const [label, setLabel] = useState(defaults.label);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (editing) {
        await updateFoodRule(editing.id, elderId, { label, type });
        onSuccess?.("Regla alimenticia actualizada");
        onCancelEdit?.();
      } else {
        await createFoodRule(elderId, { label, type });
        onSuccess?.("Regla alimenticia agregada");
        setLabel("");
        setType("prohibited");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editing ? "Editar regla alimenticia" : "Regla alimenticia"}</CardTitle>
        <p className="text-sm text-care-muted">
          Indique alimentos prohibidos, a reducir o recomendaciones.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Select value={type} onChange={(e) => setType(e.target.value as FoodRule["type"])}>
            <option value="prohibited">Prohibido</option>
            <option value="reduce">Reducir</option>
            <option value="recommendation">Recomendación</option>
            <option value="allergen">Alérgeno</option>
          </Select>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            placeholder="Ej: sal, tortillas, lácteos"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            {editing && onCancelEdit && (
              <Button type="button" variant="outline" className="w-full" onClick={onCancelEdit}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Guardando..." : editing ? "Guardar cambios" : "Guardar regla"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
