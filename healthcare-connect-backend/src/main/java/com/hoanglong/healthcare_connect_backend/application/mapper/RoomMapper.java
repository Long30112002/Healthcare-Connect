package com.hoanglong.healthcare_connect_backend.application.mapper;

import com.hoanglong.healthcare_connect_backend.application.dto.RoomResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.Room;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoomMapper {

    RoomResponse toResponse(Room room);

    List<RoomResponse> toResponseList(List<Room> rooms);
}