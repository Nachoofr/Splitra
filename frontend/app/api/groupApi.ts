import axiosInstance from './axiosConfig';

export interface Group {
  id: number;
  groupName: string;
  groupPicture: string;
  Status: string;
  createdBy: number;
  inviteToken: string;
}


export interface GroupMember {
  id: number;
  name: string;
}

export interface CreateGroupRequest {
  groupName: string;
  groupPicture: string;
}

export const groupApi = {
  getAllGroups: async (): Promise<Group[]> => {
    try {
      const response = await axiosInstance.get('/splitra/groups');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createGroup: async (data: CreateGroupRequest
): Promise<Group> => {
  try {
    const response = await axiosInstance.post<Group>(
      "/splitra/groups",
      {
        groupName: data.groupName,
        groupPicture: data.groupPicture,

      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
},

getGroupById: async (groupId: number): Promise<Group> => {
  try {
    const response = await axiosInstance.get<Group>(`/splitra/groups/${groupId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
},

getGroupMemberCount: async (groupId: number):Promise<number> => {
try{
  const response = await axiosInstance.get<number>(`/splitra/groups/${groupId}/members/count`);
  return response.data;
  } catch (error) {
    throw error;
}
},

getGroupMembers: async (groupId: number): Promise<GroupMember[]> => {
  try{
    const response = await axiosInstance.get<GroupMember[]>(`/splitra/groups/${groupId}/members`)
    return response.data;
  } catch (error) {
    throw error;
  }
},

  deleteGroup: async (groupId: number): Promise<void> => {
    try {
      const response = await axiosInstance.delete(`/splitra/groups/${groupId}/delete`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

    leaveGroup: async (groupId: number): Promise<void> => {
    try {
      const response = await axiosInstance.delete(`/splitra/groups/${groupId}/leave`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  joinGroup: async (inviteToken: string): Promise<Group> => {
    try{
    const response = await axiosInstance.post(`/splitra/groups/join/${inviteToken}`);
    return response.data;
  }catch (error) {
    throw error
  }
  },

  getNumberOfGroups: async (): Promise<number> => {
    try {
      const response = await axiosInstance.get(`splitra/groups/count`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  

};