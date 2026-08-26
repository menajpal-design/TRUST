const Committee = require('./committee.model');
const CommitteeMember = require('./committeeMember.model');
const CommitteeHistory = require('./committeeHistory.model');
const User = require('../auth/user.model');

class CommitteeService {
  static async createCommittee(organizationId, data) {
    const committee = await Committee.create({
      ...data,
      organization_id: organizationId
    });
    return committee;
  }

  static async seedBDCommitteeHierarchy(organizationId) {
    return { seeded: 0, message: 'Committees must be setup manually by organization admin.' };
  }

  static async getCommitteesByOrg(organizationId, status) {
    const query = { organization_id: organizationId, is_deleted: false };
    if (status) query.status = status;

    const committees = await Committee.find(query)
      .populate('parent_committee_id', 'name code')
      .sort({ name: 1 });

    const committeeIds = committees.map(c => c._id);
    const memberCounts = await CommitteeMember.aggregate([
      { $match: { committee_id: { $in: committeeIds }, status: 'ACTIVE' } },
      { $group: { _id: '$committee_id', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    memberCounts.forEach(m => {
      countMap[m._id.toString()] = m.count;
    });

    return committees.map(c => ({
      ...c.toObject(),
      member_count: countMap[c._id.toString()] || 0
    }));
  }

  static async getCommitteeById(organizationId, committeeId) {
    const committee = await Committee.findOne({
      _id: committeeId,
      organization_id: organizationId,
      is_deleted: false
    }).populate('parent_committee_id', 'name code');

    if (!committee) {
      const error = new Error('Committee not found');
      error.statusCode = 404;
      throw error;
    }

    const members = await CommitteeMember.find({
      committee_id: committeeId,
      status: 'ACTIVE'
    })
      .populate('user_id', 'first_name last_name email avatar_url')
      .sort({ position_order: 1 });

    return {
      committee,
      members
    };
  }

  static async updateCommittee(organizationId, committeeId, data) {
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

    Object.assign(committee, data);
    await committee.save();
    return committee;
  }

  static async deleteCommittee(organizationId, committeeId) {
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
