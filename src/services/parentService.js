import { getDataProvider } from "../data";

/**
 * parentService.js
 *
 * Logic for parent-specific operations in the ERP.
 */

export const getParentProfile = async (parentId) => {
  const provider = getDataProvider();
  return await provider.getParentById(parentId);
};

export const getChildren = async (parentId) => {
  const parent = await getParentProfile(parentId);
  if (!parent || !parent.childIds) return [];

  const provider = getDataProvider();
  const students = await provider.getStudents();

  // Resolve each child entity
  const children = parent.childIds
    .map((id) => students.find((s) => s.id === id))
    .filter(Boolean);

  return children;
};

export const getAllParents = async () => {
  const provider = getDataProvider();
  return await provider.getParents();
};

export const updateParentProfile = async (id, updates) => {
  const provider = getDataProvider();
  return await provider.updateParent(id, updates);
};

export const createParent = async (parentData) => {
  const provider = getDataProvider();
  const newParent = {
    ...parentData,
    id: `par-${Date.now()}`,
    parentId: parentData.parentId || `PAR${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return await provider.createParent(newParent);
};
