from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractUser, AbstractBaseUser, PermissionsMixin

class ProfileManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError( 'A user must have an email')
        if not username:
            raise ValueError('A user must have a username')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('superuser must have is staff true')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('superuser must have is superuser true')
        return self.create_user(email=email, username=username, password=password,**extra_fields)

class Profile(AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(("First Name"), max_length=50)
    last_name = models.CharField(("Last Name"), max_length=50)
    username = models.CharField(("Username"), max_length=50, unique=True)
    email = models.EmailField(("Email"), max_length=254)
    sex = models.CharField(("Sex"), max_length=50)
    age = models.IntegerField(("Age"), default=15)
    role = models.CharField(verbose_name=("Role"), max_length=50, default='user')
    phone_number = models.CharField(("Phone Number"), max_length=50)
    is_guest = models.BooleanField(("Is Guest"), default=True)
    is_staff = models.BooleanField(("Is Staff"), default=False)
    is_active = models.BooleanField(("Is Active"), default=True)
    created_at = models.DateField(("Created At"), auto_now=False, auto_now_add=True)
    last_login = models.DateTimeField(("Last login"), auto_now=False, auto_now_add=False, blank=True, null=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email",]

    objects = ProfileManager()

    def __str__(self):
        return self.username
    
    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        ordering = ["-created_at"]

    def has_perm(self, perm, obj = None):
        if self.role and self.role == 'admin':
            return True
        return super().has_perm(perm, obj)
    
    def has_module_perms(self, app_label):
        if self.role and self.role == 'admin':
            return True
        return super().has_module_perms(app_label)

