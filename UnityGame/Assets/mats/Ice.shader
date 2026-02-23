Shader "Custom/Ice_URP"
{
    Properties
    {
        _RampTex("Ramp", 2D) = "white" {}
        _BumpTex("Bump", 2D) = "white" {}
        _BumpRamp("Bump Ramp", 2D) = "white" {}
        _BaseColor("Color", Color) = (0, 0.83, 1, 1)
        _EdgeThickness("Silhouette Dropoff Rate", float) = 1.0
        _DistortStrength("Distort Strength", Range(0, 0.1)) = 0.4
    }

    SubShader
    {
        Tags
        {
            "RenderType"="Transparent" "Queue"="Transparent" "RenderPipeline" = "UniversalPipeline"
        }

        Pass
        {
            Name "IcePass"
            Blend SrcAlpha OneMinusSrcAlpha
            ZWrite Off
            Cull Off

            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float2 uv : TEXCOORD0;
                float3 normalOS : NORMAL;
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float2 uv : TEXCOORD0;
                float3 normalWS : TEXCOORD1;
                float3 viewDirWS : TEXCOORD3;
                float4 screenPos : TEXCOORD4;
            };

            TEXTURE2D(_RampTex);
            SAMPLER(sampler_RampTex);
            TEXTURE2D(_BumpTex);
            SAMPLER(sampler_BumpTex);
            TEXTURE2D(_BumpRamp);
            SAMPLER(sampler_BumpRamp);
            TEXTURE2D(_CameraOpaqueTexture);
            SAMPLER(sampler_CameraOpaqueTexture);

            CBUFFER_START(UnityPerMaterial)
                float4 _BaseColor;
                float _EdgeThickness;
                float _DistortStrength;
            CBUFFER_END

            Varyings vert(Attributes input)
            {
                Varyings output;
                VertexPositionInputs posInputs = GetVertexPositionInputs(input.positionOS.xyz);
                output.positionCS = posInputs.positionCS;
                output.uv = input.uv;
                output.normalWS = TransformObjectToWorldNormal(input.normalOS);
                output.viewDirWS = GetWorldSpaceViewDir(posInputs.positionWS);
                output.screenPos = ComputeScreenPos(output.positionCS);
                return output;
            }

            half4 frag(Varyings input) : SV_Target
            {
                // 1. Setup Vectors
                float3 viewDir = normalize(input.viewDirWS);
                float3 normal = normalize(input.normalWS);
                float3 bumpMap = UnpackNormal(SAMPLE_TEXTURE2D(_BumpTex, sampler_BumpTex, input.uv));
                float3 blendedNormal = normalize(normal + bumpMap * 0.5); // Blend bump into world normal

                // 2. High-Quality Refraction (Distortion)
                float2 screenUV = input.screenPos.xy / input.screenPos.w;
                float2 distort = bumpMap.xy * _DistortStrength;
                float3 sceneColor = SAMPLE_TEXTURE2D(_CameraOpaqueTexture, sampler_CameraOpaqueTexture,
       screenUV + distort).rgb;

                // 3. Fresnel & Rim (The "Icy" Edge)
                float fresnel = pow(1.0 - saturate(dot(normal, viewDir)), _EdgeThickness);
                float3 iceEdgeColor = SAMPLE_TEXTURE2D(_RampTex, sampler_RampTex, float2(fresnel, 0.5)).rgb;

                // 4. Specular Highlight (The "Glint")
                Light mainLight = GetMainLight();
                float3 halfVec = SafeNormalize(mainLight.direction + viewDir);
                float specular = pow(saturate(dot(blendedNormal, halfVec)), 32.0); // 32 is smoothness
                float3 specColor = mainLight.color * specular * 0.8;

                // 5. Lighting Ramp
                float diff = saturate(dot(blendedNormal, mainLight.direction));
                float3 lightRamp = SAMPLE_TEXTURE2D(_BumpRamp, sampler_BumpRamp, float2(diff, 0.5)).rgb;

                // Combine: Background + Ice Color + Specular Glint
                float3 finalRGB = lerp(sceneColor, iceEdgeColor * lightRamp, fresnel * _BaseColor.a);
                finalRGB += specColor; // Add the shine on top

                return float4(finalRGB, 1.0);
            }
            ENDHLSL
        }
    }
}