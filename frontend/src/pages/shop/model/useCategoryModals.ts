// frontend/src/pages/shop/model/useCategoryModals.ts
import { useState } from "react";
import type { ShopCategoryResponse } from "../api/category.api";

export function useCategoryModals() {
    const [editOpen, setEditOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<ShopCategoryResponse | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const openAddCategory = () => {
        setEditCategory(null);
        setEditOpen(true);
    };

    const openEditCategory = (cat: ShopCategoryResponse) => {
        setEditCategory(cat);
        setEditOpen(true);
    };

    const openDeleteCategory = (id: string) => {
        setDeleteId(id);
        setDeleteOpen(true);
    };

    const closeEdit = () => setEditOpen(false);
    const closeDelete = () => setDeleteOpen(false);

    return {
        editOpen,
        editCategory,
        deleteOpen,
        deleteId,
        openAddCategory,
        openEditCategory,
        openDeleteCategory,
        closeEdit,
        closeDelete,
    };
}