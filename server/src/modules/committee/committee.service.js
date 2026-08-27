const Committee = require('./committee.model');
const CommitteeMember = require('./committeeMember.model');
const CommitteeHistory = require('./committeeHistory.model');
const User = require('../auth/user.model');

class CommitteeService {
  static getHierarchyRank(levelOrType) {
    const key = String(levelOrType || '').toUpperCase();
    const rankMap = {
      NATIONAL: 1,
      CENTRAL: 1,
      EXECUTIVE: 1,
      DIVISION: 2,
      DISTRICT: 3,
      CITY_CORPORATION: 4,
      UPAZILA: 4,
      UNION: 5,
      CITY_CORPORATION_WARD: 6,
      WARD: 6,
      VILLAGE: 7,
      SPECIALIZED: 8,
      SUB: 8
    };
    return rankMap[key] || 8;
  }

  static getAllowedChildLevels(parentLevelOrType) {
    const key = String(parentLevelOrType || 'CENTRAL').toUpperCase();
    const childMatrix = {
      NATIONAL: ['DIVISION', 'DISTRICT', 'CITY_CORPORATION', 'UPAZILA', 'UNION', 'CITY_CORPORATION_WARD', 'WARD', 'VILLAGE', 'SPECIALIZED', 'SUB'],
      CENTRAL: ['DIVISION', 'DISTRICT', 'CITY_CORPORATION', 'UPAZILA', 'UNION', 'CITY_CORPORATION_WARD', 'WARD', 'VILLAGE', 'SPECIALIZED', 'SUB'],
      EXECUTIVE: ['DIVISION', 'DISTRICT', 'CITY_CORPORATION', 'UPAZILA', 'UNION', 'CITY_CORPORATION_WARD', 'WARD', 'VILLAGE', 'SPECIALIZED', 'SUB'],
      DIVISION: ['DISTRICT', 'CITY_CORPORATION', 'UPAZILA', 'UNION', 'CITY_CORPORATION_WARD', 'WARD', 'VILLAGE', 'SPECIALIZED', 'SUB'],
      DISTRICT: ['UPAZILA', 'CITY_CORPORATION', 'UNION', 'CITY_CORPORATION_WARD', 'WARD', 'VILLAGE', 'SPECIALIZED', 'SUB'],
      CITY_CORPORATION: ['CITY_CORPORATION_WARD', 'WARD', 'SPECIALIZED', 'SUB'],
      UPAZILA: ['UNION', 'WARD', 'VILLAGE', 'SPECIALIZED', 'SUB'],
      UNION: ['WARD', 'VILLAGE', 'SPECIALIZED', 'SUB'],
      CITY_CORPORATION_WARD: ['SUB', 'SPECIALIZED'],
      WARD: ['VILLAGE', 'SUB', 'SPECIALIZED'],
      VILLAGE: ['SUB', 'SPECIALIZED']
    };
    return childMatrix[key] || ['SUB', 'SPECIALIZED'];
  }

  static async createCommittee(organizationId, data, requestingUser = null) {
    const committeeLevel = String(data.committee_level || 'CENTRAL').toUpperCase();
    const committeeType = String(data.committee_type || data.committee_level || 'EXECUTIVE').toUpperCase();

    // If parent committee is specified, validate hierarchy integrity
    if (data.parent_committee_id) {
      const parent = await Committee.findOne({
        _id: data.parent_committee_id,
        organization_id: organizationId,
        is_deleted: false
      });

      if (!parent) {
        const error = new Error('Parent committee does not exist in this organization');
        error.statusCode = 400;
        throw error;
      }

      const parentLevel = parent.committee_level || parent.committee_type || 'CENTRAL';
      const allowedChildren = CommitteeService.getAllowedChildLevels(parentLevel);

      if (!allowedChildren.includes(committeeLevel) && !allowedChildren.includes(committeeType)) {
        const error = new Error(`Invalid Hierarchy: ${parentLevel} committee cannot directly establish a ${committeeLevel} committee. Allowed child tiers: ${allowedChildren.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
    }

    // Role & Superiority Guard for committee creation
    if (requestingUser && !requestingUser.is_global_superadmin) {
      const userRole = String(requestingUser.role || 'MEMBER').toUpperCase();
      const isTopOrgLeader = ['ORG_OWNER', 'OWNER', 'ADMIN'].includes(userRole);

      if (!isTopOrgLeader) {
        // Find requesting user's highest active committee
        const userCommittees = await CommitteeMember.find({ user_id: requestingUser._id, status: 'ACTIVE' }).populate('committee_id');
        if (userCommittees.length === 0) {
          const error = new Error('Access Denied: Only organization leaders or superior committee executives can create committees.');
          error.statusCode = 403;
          throw error;
        }

        let userBestRank = 99;
        let userBestLevel = 'MEMBER';
        userCommittees.forEach(cm => {
          if (cm.committee_id) {
            const rank = CommitteeService.getHierarchyRank(cm.committee_id.committee_level || cm.committee_id.committee_type);
            if (rank < userBestRank) {
              userBestRank = rank;
              userBestLevel = cm.committee_id.committee_level || cm.committee_id.committee_type;
            }
          }
        });

        const targetRank = CommitteeService.getHierarchyRank(committeeLevel);
        const allowedForUser = CommitteeService.getAllowedChildLevels(userBestLevel);

        if (userBestRank >= targetRank || (!allowedForUser.includes(committeeLevel) && !allowedForUser.includes(committeeType))) {
          const error = new Error(`Access Denied: Your committee tier (${userBestLevel}) cannot create a ${committeeLevel} committee. You can only create: ${allowedForUser.join(', ')}`);
          error.statusCode = 403;
          throw error;
        }
      }
    }

    const committee = await Committee.create({
      ...data,
      committee_level: committeeLevel,
      committee_type: committeeType,
      organization_id: organizationId
    });
    return committee;
  }

  static async seedBDCommitteeHierarchy(organizationId) {
    return { seeded: 0, message: 'Committees must be setup manually by organization admin.' };
  }

  static getAllSubordinateCommitteeIds(allCommittees, rootIds) {
    const allowed = new Set(rootIds.map(id => id.toString()));
    let addedNew = true;

    while (addedNew) {
      addedNew = false;
      allCommittees.forEach(c => {
        const cId = c._id.toString();
        const pId = c.parent_committee_id?._id ? c.parent_committee_id._id.toString() : c.parent_committee_id?.toString();
        if (pId && allowed.has(pId) && !allowed.has(cId)) {
          allowed.add(cId);
          addedNew = true;
        }
      });
    }

    return allowed;
  }

  static async getCommitteesByOrg(organizationId, status, requestingUser = null) {
    const query = { organization_id: organizationId, is_deleted: false };
    if (status) query.status = status;

    const allCommittees = await Committee.find(query)
      .populate('parent_committee_id', 'name code committee_level committee_type')
      .sort({ name: 1 });

    let visibleCommittees = allCommittees;

    // Strict Top-Down Visibility: Lower tier CANNOT see upper management, but Upper tier sees all subordinate management
    if (requestingUser && !requestingUser.is_global_superadmin) {
      const userRole = String(requestingUser.role || 'MEMBER').toUpperCase();
      const isTopOrgLeader = ['ORG_OWNER', 'OWNER', 'ADMIN'].includes(userRole);

      if (!isTopOrgLeader) {
        const userMemberships = await CommitteeMember.find({
          user_id: requestingUser._id,
          status: 'ACTIVE'
        });

        if (!userMemberships || userMemberships.length === 0) {
          return [];
        }

        const userRootIds = userMemberships.map(m => m.committee_id.toString());
        const allowedIds = CommitteeService.getAllSubordinateCommitteeIds(allCommittees, userRootIds);

        // Filter: only user's own committees and their subordinate branches are returned
        visibleCommittees = allCommittees.filter(c => allowedIds.has(c._id.toString()));
      }
    }

    const committeeIds = visibleCommittees.map(c => c._id);
    const memberCounts = await CommitteeMember.aggregate([
      { $match: { committee_id: { $in: committeeIds }, status: 'ACTIVE' } },
      { $group: { _id: '$committee_id', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    memberCounts.forEach(m => {
      countMap[m._id.toString()] = m.count;
    });

    // Count direct subordinate child committees
    const childCountMap = {};
    visibleCommittees.forEach(c => {
      if (c.parent_committee_id?._id) {
        const pId = c.parent_committee_id._id.toString();
        childCountMap[pId] = (childCountMap[pId] || 0) + 1;
      }
    });

    return visibleCommittees.map(c => {
      const cObj = c.toObject();
      const rank = CommitteeService.getHierarchyRank(c.committee_level || c.committee_type);
      return {
        ...cObj,
        hierarchy_rank: rank,
        member_count: countMap[c._id.toString()] || 0,
        subordinate_count: childCountMap[c._id.toString()] || 0,
        allowed_child_levels: CommitteeService.getAllowedChildLevels(c.committee_level || c.committee_type)
      };
    });
  }

  static async getCommitteeById(organizationId, committeeId, requestingUser = null) {
    const committee = await Committee.findOne({
      _id: committeeId,
      organization_id: organizationId,
      is_deleted: false
    }).populate('parent_committee_id', 'name code committee_level committee_type');

    if (!committee) {
      const error = new Error('Committee not found');
      error.statusCode = 404;
      throw error;
    }

    // Strict Top-Down Visibility Check: Lower tier cannot inspect superior committee management
    if (requestingUser && !requestingUser.is_global_superadmin) {
      const userRole = String(requestingUser.role || 'MEMBER').toUpperCase();
      const isTopOrgLeader = ['ORG_OWNER', 'OWNER', 'ADMIN'].includes(userRole);

      if (!isTopOrgLeader) {
        const allOrgCommittees = await Committee.find({ organization_id: organizationId, is_deleted: false });
        const userMemberships = await CommitteeMember.find({
          user_id: requestingUser._id,
          status: 'ACTIVE'
        });

        const userRootIds = userMemberships.map(m => m.committee_id.toString());
        const allowedIds = CommitteeService.getAllSubordinateCommitteeIds(allOrgCommittees, userRootIds);

        if (!allowedIds.has(committeeId.toString())) {
          const error = new Error('Access Denied: Upper tier management cannot be viewed or accessed by lower committee members.');
          error.statusCode = 403;
          throw error;
        }
      }
    }

    const members = await CommitteeMember.find({
      committee_id: committeeId,
      status: 'ACTIVE'
    })
      .populate('user_id', 'first_name last_name email avatar_url phone')
      .sort({ position_order: 1 });

    const history = await CommitteeHistory.find({
      committee_id: committeeId
    }).sort({ created_at: -1 });

    return {
      committee,
      members,
      history
    };
  }

  static async updateCommittee(organizationId, committeeId, data, requestingUser = null) {
    const committee = await Committee.findOne({
      _id: committeeId,
      organization_id: organizationId,
      is_deleted: false
    });

    if (!committee) {
      const error = new Error('Committee not found');
      error.statusCode = 404;
      throw error;
    }

    // Top-Down Authorization Check
    if (requestingUser && !requestingUser.is_global_superadmin) {
      const userRole = String(requestingUser.role || 'MEMBER').toUpperCase();
      const isTopOrgLeader = ['ORG_OWNER', 'OWNER', 'ADMIN'].includes(userRole);

      if (!isTopOrgLeader) {
        const allOrgCommittees = await Committee.find({ organization_id: organizationId, is_deleted: false });
        const userMemberships = await CommitteeMember.find({
          user_id: requestingUser._id,
          status: 'ACTIVE'
        });

        const userRootIds = userMemberships.map(m => m.committee_id.toString());
        const allowedIds = CommitteeService.getAllSubordinateCommitteeIds(allOrgCommittees, userRootIds);

        if (!allowedIds.has(committeeId.toString())) {
          const error = new Error('Access Denied: Lower tier leaders cannot modify superior committees.');
          error.statusCode = 403;
          throw error;
        }
      }
    }

    Object.assign(committee, data);
    await committee.save();
    return committee;
  }

  static async deleteCommittee(organizationId, committeeId, requestingUser = null) {
    const committee = await Committee.findOne({
      _id: committeeId,
      organization_id: organizationId,
      is_deleted: false
    });

    if (!committee) {
      const error = new Error('Committee not found');
      error.statusCode = 404;
      throw error;
    }

    // Top-Down Authorization Check
    if (requestingUser && !requestingUser.is_global_superadmin) {
      const userRole = String(requestingUser.role || 'MEMBER').toUpperCase();
      const isTopOrgLeader = ['ORG_OWNER', 'OWNER', 'ADMIN'].includes(userRole);

      if (!isTopOrgLeader) {
        const allOrgCommittees = await Committee.find({ organization_id: organizationId, is_deleted: false });
        const userMemberships = await CommitteeMember.find({
          user_id: requestingUser._id,
          status: 'ACTIVE'
        });

        const userRootIds = userMemberships.map(m => m.committee_id.toString());
        const allowedIds = CommitteeService.getAllSubordinateCommitteeIds(allOrgCommittees, userRootIds);

        if (!allowedIds.has(committeeId.toString())) {
          const error = new Error('Access Denied: Lower tier leaders cannot delete superior committees.');
          error.statusCode = 403;
          throw error;
        }
      }
    }

    committee.is_deleted = true;
    await committee.save();
    return { message: 'Committee deleted successfully' };
  }

  static getHierarchyRank(type) {
    const rankMap = {
      NATIONAL: 1,
      CENTRAL: 1,
      EXECUTIVE: 1,
      DIVISION: 2,
      DISTRICT: 3,
      UPAZILA: 4,
      UNION: 5,
      WARD: 6,
      VILLAGE: 7,
      SCHOOL: 7,
      COLLEGE: 7,
      MOSQUE: 7,
      MARKET: 7,
      WOMEN: 7,
      YOUTH: 7,
      SUB: 7
    };
    return rankMap[type] || 7;
  }

  static async addMemberToCommittee(organizationId, committeeId, data, requestingUser = null) {
    const committee = await Committee.findOne({
      _id: committeeId,
      organization_id: organizationId,
      is_deleted: false
    });

    if (!committee) {
      const error = new Error('Committee not found');
      error.statusCode = 404;
      throw error;
    }

    // Hierarchy Tier Check: Lower committee cannot assign members to superior committee
    if (requestingUser && !requestingUser.is_global_superadmin) {
      const userRole = String(requestingUser.role || 'MEMBER').toUpperCase();
      const isTopOrgLeader = ['ORG_OWNER', 'OWNER', 'ADMIN'].includes(userRole);

      if (!isTopOrgLeader) {
        // Find requesting user's highest active committee membership
        const userCommittees = await CommitteeMember.find({ user_id: requestingUser._id, status: 'ACTIVE' }).populate('committee_id');
        let userBestRank = 99;
        userCommittees.forEach(cm => {
          if (cm.committee_id) {
            const rank = CommitteeService.getHierarchyRank(cm.committee_id.committee_type);
            if (rank < userBestRank) userBestRank = rank;
          }
        });

        const targetRank = CommitteeService.getHierarchyRank(committee.committee_type);

        // Lower committee (higher rank number) cannot manage superior committee (lower rank number)
        if (userBestRank > targetRank) {
          const error = new Error('Access Denied: Lower tier committee leaders cannot assign members to superior/parent committees.');
          error.statusCode = 403;
          throw error;
        }
      }
    }

    const existing = await CommitteeMember.findOne({
      committee_id: committeeId,
      user_id: data.user_id,
      status: 'ACTIVE'
    });

    if (existing) {
      const error = new Error('User is already an active member of this committee');
      error.statusCode = 400;
      throw error;
    }

    const committeeMember = await CommitteeMember.create({
      committee_id: committeeId,
      user_id: data.user_id,
      position: data.position || data.position_title,
      position_order: data.position_order || 99,
      joined_date: data.joined_date || data.start_date ? new Date(data.joined_date || data.start_date) : new Date(),
      status: 'ACTIVE'
    });

    return committeeMember;
  }

  static async removeMemberFromCommittee(organizationId, committeeId, memberId, requestingUser = null) {
    const committeeMember = await CommitteeMember.findOne({
      _id: memberId,
      committee_id: committeeId
    });

    if (!committeeMember) {
      const error = new Error('Committee member record not found');
      error.statusCode = 404;
      throw error;
    }

    // Hierarchy Tier Check
    if (requestingUser && !requestingUser.is_global_superadmin) {
      const userRole = String(requestingUser.role || 'MEMBER').toUpperCase();
      const isTopOrgLeader = ['ORG_OWNER', 'OWNER', 'ADMIN'].includes(userRole);

      if (!isTopOrgLeader) {
        const committee = await Committee.findById(committeeId);
        const userCommittees = await CommitteeMember.find({ user_id: requestingUser._id, status: 'ACTIVE' }).populate('committee_id');
        let userBestRank = 99;
        userCommittees.forEach(cm => {
          if (cm.committee_id) {
            const rank = CommitteeService.getHierarchyRank(cm.committee_id.committee_type);
            if (rank < userBestRank) userBestRank = rank;
          }
        });

        const targetRank = committee ? CommitteeService.getHierarchyRank(committee.committee_type) : 1;
        if (userBestRank > targetRank) {
          const error = new Error('Access Denied: Lower tier committee leaders cannot remove members from superior committees.');
          error.statusCode = 403;
          throw error;
        }
      }
    }

    committeeMember.status = 'REMOVED';
    await committeeMember.save();

    await CommitteeHistory.create({
      committee_id: committeeId,
      user_id: committeeMember.user_id,
      position: committeeMember.position,
      start_date: committeeMember.joined_date,
      end_date: new Date(),
      reason: 'Removed by admin'
    });

    return { message: 'Member removed from committee' };
  }
}

module.exports = CommitteeService;
