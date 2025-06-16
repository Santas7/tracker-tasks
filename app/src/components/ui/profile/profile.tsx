import { useState, useEffect } from "react";
import { Title, Text, Notification } from "@mantine/core";
import api from "../../../core/api/api";

interface ProfileData {
  id: number;
  username: string;
  email: string;
}

export const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile");
        setProfile(response.data);
      } catch (err: { response: { data: { message: string } } }) {
        setError(err.response?.data?.message || "Не удалось загрузить профиль");
      }
    };
    fetchProfile();
  }, []);

  return (
    <div>
      <Title order={2}>Профиль</Title>
      {error && (
        <Notification color="red" title="Ошибка" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}
      {profile && (
        <>
          <Text mt="md">ID пользователя: {profile.id}</Text>
          <Text mt="md">Имя пользователя: {profile.username}</Text>
          <Text mt="sm">Email: {profile.email}</Text>
        </>
      )}
    </div>
  );
};
