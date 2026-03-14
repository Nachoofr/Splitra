package com.intern.splitra.mapper;

import com.intern.splitra.dto.SettlementPaymentDto;
import com.intern.splitra.model.Settlement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SettlementMapper {
    @Mapping(source= "group.id", target = "groupId")
    @Mapping(source= "fromUser.id", target = "fromUserId")
    @Mapping(source = "toUser.id", target = "toUserId")
    @Mapping(source = "fromUser.fullName", target = "fromUserName")
    @Mapping(source = "toUser.fullName", target = "toUserName")
    SettlementPaymentDto toDto(Settlement settlement);

    @Mapping(source = "groupId", target = "group.id")
    @Mapping(source = "fromUserId", target = "fromUser.id")
    @Mapping(source = "toUserId", target = "toUser.id")
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "paymentMethod", ignore = true)
    Settlement toEntity(SettlementPaymentDto settlementPaymentDto);

//    @Mapping(source = "groupId", target = "group.id")
//    @Mapping(source = "fromUserId", target = "fromUser.id")
//    @Mapping(source = "toUserId", target = "toUser.id")
//    @Mapping(target = "status", ignore = true)
//    @Mapping(target = "paymentMethod", ignore = true)
//    Settlement update(SettlementPaymentDto settlementPaymentDto, @MappingTarget Settlement settlement);
}
