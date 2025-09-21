import { prisma } from './prisma'

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'publish' | 'moderate'
export type PermissionResource = 'article' | 'category' | 'comment' | 'user' | 'organization' | 'admin'

export interface UserWithRoles {
  id: string
  email: string
  name?: string
  userRoles: Array<{
    role: {
      id: string
      name: string
      rolePermissions: Array<{
        permission: {
          resource: string
          action: string
        }
      }>
    }
  }>
}

export async function getUserWithRoles(userId: string): Promise<UserWithRoles | null> {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      }
    }
  })
}

export function hasPermission(
  user: UserWithRoles,
  resource: PermissionResource,
  action: PermissionAction
): boolean {
  return user.userRoles.some(userRole =>
    userRole.role.rolePermissions.some(rolePermission =>
      rolePermission.permission.resource === resource &&
      rolePermission.permission.action === action
    )
  )
}

export function hasRole(user: UserWithRoles, roleName: string): boolean {
  return user.userRoles.some(userRole => userRole.role.name === roleName)
}

export function isAdmin(user: UserWithRoles): boolean {
  return hasRole(user, 'admin') || hasRole(user, 'super_admin')
}

export function canModerateComments(user: UserWithRoles): boolean {
  return hasPermission(user, 'comment', 'moderate') || isAdmin(user)
}

export function canPublishArticles(user: UserWithRoles): boolean {
  return hasPermission(user, 'article', 'publish') || isAdmin(user)
}

export function canManageCategories(user: UserWithRoles): boolean {
  return hasPermission(user, 'category', 'create') || isAdmin(user)
}

// Initialize default roles and permissions
export async function initializeRolesAndPermissions() {
  // Create default permissions
  const permissions = [
    // Article permissions
    { resource: 'article', action: 'create' },
    { resource: 'article', action: 'read' },
    { resource: 'article', action: 'update' },
    { resource: 'article', action: 'delete' },
    { resource: 'article', action: 'publish' },
    
    // Category permissions
    { resource: 'category', action: 'create' },
    { resource: 'category', action: 'read' },
    { resource: 'category', action: 'update' },
    { resource: 'category', action: 'delete' },
    
    // Comment permissions
    { resource: 'comment', action: 'create' },
    { resource: 'comment', action: 'read' },
    { resource: 'comment', action: 'update' },
    { resource: 'comment', action: 'delete' },
    { resource: 'comment', action: 'moderate' },
    
    // User permissions
    { resource: 'user', action: 'read' },
    { resource: 'user', action: 'update' },
    { resource: 'user', action: 'delete' },
    
    // Organization permissions
    { resource: 'organization', action: 'create' },
    { resource: 'organization', action: 'read' },
    { resource: 'organization', action: 'update' },
    { resource: 'organization', action: 'delete' },
    
    // Admin permissions
    { resource: 'admin', action: 'read' },
    { resource: 'admin', action: 'update' },
  ]

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { 
        resource_action: {
          resource: permission.resource,
          action: permission.action
        }
      },
      update: {},
      create: {
        name: `${permission.resource}:${permission.action}`,
        resource: permission.resource,
        action: permission.action,
        description: `Permission to ${permission.action} ${permission.resource}`
      }
    })
  }

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access'
    }
  })

  const editorRole = await prisma.role.upsert({
    where: { name: 'editor' },
    update: {},
    create: {
      name: 'editor',
      description: 'Editor who can create and publish articles'
    }
  })

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'moderator' },
    update: {},
    create: {
      name: 'moderator',
      description: 'Moderator who can moderate comments'
    }
  })

  const authorRole = await prisma.role.upsert({
    where: { name: 'author' },
    update: {},
    create: {
      name: 'author',
      description: 'Author who can create articles'
    }
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user'
    }
  })

  // Assign permissions to roles
  const allPermissions = await prisma.permission.findMany()

  // Admin gets all permissions
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id
      }
    })
  }

  // Editor permissions
  const editorPermissions = allPermissions.filter(p => 
    (p.resource === 'article' && ['create', 'read', 'update', 'publish'].includes(p.action)) ||
    (p.resource === 'category' && p.action === 'read') ||
    (p.resource === 'comment' && ['read', 'moderate'].includes(p.action))
  )

  for (const permission of editorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: editorRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: editorRole.id,
        permissionId: permission.id
      }
    })
  }

  // Moderator permissions
  const moderatorPermissions = allPermissions.filter(p => 
    (p.resource === 'comment' && ['read', 'moderate', 'delete'].includes(p.action)) ||
    (p.resource === 'article' && p.action === 'read')
  )

  for (const permission of moderatorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: moderatorRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: moderatorRole.id,
        permissionId: permission.id
      }
    })
  }

  // Author permissions
  const authorPermissions = allPermissions.filter(p => 
    (p.resource === 'article' && ['create', 'read', 'update'].includes(p.action)) ||
    (p.resource === 'comment' && p.action === 'read')
  )

  for (const permission of authorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: authorRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: authorRole.id,
        permissionId: permission.id
      }
    })
  }

  // User permissions
  const userPermissions = allPermissions.filter(p => 
    (p.resource === 'comment' && ['create', 'read'].includes(p.action)) ||
    (p.resource === 'article' && p.action === 'read')
  )

  for (const permission of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id
      }
    })
  }

  console.log('Roles and permissions initialized successfully')
}