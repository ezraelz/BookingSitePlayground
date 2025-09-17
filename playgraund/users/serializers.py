from rest_framework import serializers
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'sex',
            'age',
            'role',
            'phone_number',
            'is_guest',  
            'is_active'
        ]


class CreateUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'username',
            'email',
            'phone_number',
            'password'  
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        # ensure password is hashed properly
        password = validated_data.pop('password', None)
        user = Profile(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

