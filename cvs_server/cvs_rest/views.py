from cvs_rest.models import * 
from cvs_rest.serializers import *
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response

from rest_framework import status, generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework import generics
from django.contrib.contenttypes.models import ContentType
from django_filters.rest_framework import DjangoFilterBackend
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import re
import ast

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data.get('user')
        token, created = Token.objects.get_or_create(user=user)
        response_json = UserSerializer(user).data
        response_json['token'] = token.key
        return Response(response_json)



@api_view(['POST'])
def sign_up(request):
    
    data = request.data
    name = data.get('username')
    password = data.get('password')
    email = data.get('email')
    name_regex = re.compile(r'^[A-Za-z]{1}[A-Za-z0-9_]{3,19}$') 
    
    if not (name and password and email):
        return Response(data={'message':'username or password or email field is missing.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not name_regex.match(name):
        return Response(data={'message':'username is at least 4 to 20 only with alaphabet, number and under score'}, status=status.HTTP_400_BAD_REQUEST)
    
    if email :
        try:
            validate_email(email)
        except ValidationError:
            return Response(data={'message':'email is not validated.'}, status=status.HTTP_400_BAD_REQUEST) 

    if CustomUser.objects.filter(username=name):
        return Response(data={'message':'User name aleady exists.'}, status=status.HTTP_400_BAD_REQUEST)
            
    if len(password) < 6:
        return Response(data={'message':'Password should be at least 6.'}, status=status.HTTP_400_BAD_REQUEST)
        
    user, created = CustomUser.objects.get_or_create(username=name, email=email)
    if created:
        user.set_password(password)
        token, created = Token.objects.get_or_create(user=user)
        response_json = UserSerializer(user).data
        response_json['token'] = token.key
        user.save()
        return Response(response_json, status=status.HTTP_201_CREATED)
    else:
        return Response(data={'message':'User already exist'}, status=status.HTTP_400_BAD_REQUEST)

#/users
class CustomUserList(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

#/users/id
class CustomUserDetail(generics.RetrieveAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

#/products
class ProductList(generics.ListAPIView) :
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = (filters.SearchFilter, DjangoFilterBackend)
    search_fields = ('name',)
    filter_fields = ('price', 'large_category', 'small_category', 'manufacturer', 'PB')

#/products/id
class ProductDetail(generics.RetrieveAPIView) :
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer


#일단 유저빼고 해봄
@api_view(['POST'])
@permission_classes((IsAuthenticatedOrReadOnly,))
def create_comment(request, format=None) :

    #create and save new rating object
    data = request.data
    rating = data.get('rating')
    content = data.get('content')
    product = data.get('product')
        
    if not (rating and content and product):
        return Response(data={'message':'content or product or rating Field is not existed'}, status=status.HTTP_400_BAD_REQUEST)

    data['rating'] = {'value':rating, 'user_id':request.user.id, 'comment':1}
    serializer = CommentSerializer(data=data) 
    
    if serializer.is_valid():
        serializer.save(user_id=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly,])
def comment_detail(request, pk, format=None) :
    try:
        comment = Comment.objects.get(pk=pk)
    except Comment.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET' :
        serializer = CommentSerializer(comment)
        return Response(serializer.data)
    
    elif request.method == 'PUT' :
        serializer = CommentSerializer(comment, data=request.data)
        if serializer.is_valid() :
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE' :
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


    """
    ratingSerializer = RatingSerializer(data=request.data)
    ratingSerializer.is_valid(raise_exception=True)
    ratingData = ratingSerializer.validated_data.get('')

    serializer = CommentSerializer(dvata=request.data, context={'request':request})
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    content = data.get('content')
    rating = data.get('rating')
    user = data.get('user')

    #rating, user_id, 
    if 'created' in kwargs :
        if kwargs['created'] :
            instance = kwargs['instance']
            ctype = ContentType.objects.get_for_model(instance)
            entry = Entry.objects.get_or_create(content_type=ctype, object_id=instance.id, pub_date=instance.pub_date)
    """

    

    

"""



#/reviews
class ReviewList(generics.ListCreateAPIView) :
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('user_id',)


#/reviews/pk
class ReviewDetail(generics.RetrieveUpdateDestroyAPIView) :
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


#/comments/pk
class CommentDetail(generics.RetrieveUpdateDestroyAPIView) :
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer


#/users/pk
class CustomUserDetail(generics.RetrieveAPIView) :
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer


#/recipes
class RecipeList(generics.ListCreateAPIView) :
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('user_id',)


#/recipes/pk
class RecipeDetail(generics.RetrieveUpdateDestroyAPIView) :
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

"""
