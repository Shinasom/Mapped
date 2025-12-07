import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import VisitedLocation

# Get an instance of a logger
logger = logging.getLogger(__name__)

class MarkLocationView(APIView):
    permission_classes = [IsAuthenticated]

    def log_action(self, user, action, name, level, parent, grandparent):
        """
        Helper to print formatted logs to the console
        """
        level_map = {0: 'Country', 1: 'State', 2: 'District'}
        level_str = level_map.get(level, 'Unknown')
        
        # Build the log message
        msg = f"🌍 [MAP ACTIVITY] User: {user.username} | Action: {action} | {level_str}: {name}"
        
        if parent:
            msg += f" | Region: {parent}"
        if grandparent:
            msg += f" | Country: {grandparent}"
            
        # Print to terminal (so you see it immediately)
        print(msg)
        # Also log to system logger (good for production files later)
        logger.info(msg)

    def post(self, request):
        """
        Smart Mark: Handles Countries, States, or Districts.
        """
        user = request.user
        data = request.data
        
        name = data.get('name')
        level = data.get('level') 
        parent = data.get('parent')       
        grandparent = data.get('grandparent') 

        if name is None or level is None:
            return Response({'error': 'Missing name or level'}, status=400)

        with transaction.atomic():
            # 1. Always mark the target location
            obj, created = VisitedLocation.objects.get_or_create(
                user=user,
                name=name,
                level=level,
                parent=parent,
                grandparent=grandparent
            )

            # 2. LOGGING (Only if actually new)
            if created:
                self.log_action(user, "MARKED", name, level, parent, grandparent)
            else:
                print(f"ℹ️  [INFO] User {user.username} tried to mark {name} (Already visited)")

            # 3. BUBBLE UP LOGIC
            if level == 2 and parent and grandparent:
                # Mark State
                s_obj, s_created = VisitedLocation.objects.get_or_create(
                    user=user, name=parent, level=1, parent=grandparent
                )
                if s_created: print(f"    ↳ Auto-marked Parent State: {parent}")

                # Mark Country
                c_obj, c_created = VisitedLocation.objects.get_or_create(
                    user=user, name=grandparent, level=0
                )
                if c_created: print(f"    ↳ Auto-marked Grandparent Country: {grandparent}")
            
            elif level == 1 and parent:
                # Mark Country
                c_obj, c_created = VisitedLocation.objects.get_or_create(
                    user=user, name=parent, level=0
                )
                if c_created: print(f"    ↳ Auto-marked Parent Country: {parent}")

        return Response({'status': 'marked', 'name': name})

    def delete(self, request):
        """
        Smart Un-mark.
        """
        user = request.user
        data = request.data
        name = data.get('name')
        level = data.get('level')
        
        # We fetch parent info from DB if not provided, for better logging
        if level is not None and name:
            target = VisitedLocation.objects.filter(user=user, name=name, level=level).first()
            parent = target.parent if target else data.get('parent')
            grandparent = target.grandparent if target else data.get('grandparent')
        else:
            parent = data.get('parent')
            grandparent = data.get('grandparent')

        with transaction.atomic():
            # 1. Delete the specific item
            deleted_count, _ = VisitedLocation.objects.filter(user=user, name=name, level=level).delete()

            if deleted_count > 0:
                self.log_action(user, "UNMARKED", name, level, parent, grandparent)

            # 2. CASCADE DOWN logic
            if level == 0: # Country
                # Delete all children
                d_del, _ = VisitedLocation.objects.filter(user=user, grandparent=name).delete()
                s_del, _ = VisitedLocation.objects.filter(user=user, parent=name).delete()
                if s_del or d_del:
                    print(f"    🔥 Cascade Delete: Removed {s_del} states and {d_del} districts in {name}")
            
            elif level == 1: # State
                d_del, _ = VisitedLocation.objects.filter(user=user, parent=name).delete()
                if d_del:
                    print(f"    🔥 Cascade Delete: Removed {d_del} districts in {name}")

        return Response({'status': 'unmarked', 'name': name})

class UserMapDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Fetch ALL visited locations to paint the map.
        """
        locations = VisitedLocation.objects.filter(user=request.user)
        return Response({
            'districts': locations.filter(level=2).values_list('name', flat=True),
            'states': locations.filter(level=1).values_list('name', flat=True),
            'countries': locations.filter(level=0).values_list('name', flat=True),
        })