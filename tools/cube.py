import bpy
import math

cam = bpy.data.objects["Camera"]
cam.rotation_mode = 'XYZ' #Not quaternions


def addKeyFrames(curFrame):    
    #Forward
    cam.rotation_euler = (math.pi/2, 0, 0) 
    cam.keyframe_insert(data_path="rotation_euler", frame=curFrame)
    cam.keyframe_insert(data_path="location", frame=curFrame)
    
    #Left
    cam.rotation_euler.z = math.pi/2
    cam.keyframe_insert(data_path="rotation_euler", frame=curFrame + 1)
    
    #Back
    cam.rotation_euler.z = math.pi
    cam.keyframe_insert(data_path="rotation_euler", frame=curFrame + 2)
    
    #Right
    cam.rotation_euler.z = (math.pi/2)*3
    cam.keyframe_insert(data_path="rotation_euler", frame=curFrame + 3)
    
    #Top 
    cam.rotation_euler = (math.pi, 0, -math.pi)
    cam.keyframe_insert(data_path="rotation_euler", frame=curFrame + 4)
    
    #Bottom
    cam.rotation_euler = (0, 0, 0)
    cam.keyframe_insert(data_path="rotation_euler", frame=curFrame + 5)
    cam.keyframe_insert(data_path="location", frame=curFrame+5)


addKeyFrames(bpy.context.scene.frame_current)

        
        
